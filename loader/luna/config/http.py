import http.server
import json
import logging
import os.path
import subprocess
import urllib.parse
from datetime import datetime
try:
    import zoneinfo
except ImportError:
    from backports import zoneinfo
from . import CONFIG_DIR

log = logging.getLogger()
HTML_FILE = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', '..', 'setup', 'index.html') # even sorrier

def set_time(dt: datetime):
    # Set the hardware clock.  It must be set with a local timestamp, but we want it to internally store UTC.
    subprocess.check_call(['sudo', 'hwclock', '--set', '--utc', '--date', dt.astimezone().strftime('%Y-%m-%d %H:%M:%S')])
    # Jump the system time to match
    subprocess.check_call(['sudo', 'hwclock', '--hctosys'])
    # Set the timezone
    subprocess.check_call(['sudo', 'timedatectl', 'set-timezone', dt.tzinfo.key])

def save_config(config):
    for name in ['latitude', 'longitude']:
        with open(os.path.join(CONFIG_DIR, name), 'w') as f:
            value = float(config[name])
            f.write(str(value))

    # date from JS comes like `2023-12-19T13:19`, in the timezone in tzcode.
    tz_code = config['tzcode']
    dt = datetime.strptime(config['datetime'], '%Y-%m-%dT%H:%M').replace(tzinfo=ZoneInfo(tz_code))
    set_time(dt)

class Handler(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        '''Serve the form, or save GET-provided data.'''
        try:
            query = urllib.parse.urlparse(self.path).query
            parsed = urllib.parse.parse_qs(query)
            if parsed and 'config' in parsed:
                config = json.loads(parsed['config'])
                log.info(f'saving {config}')
                save_config(config)
                self.send_response(303)
                self.send_header('Location', '/#success')
                self.end_headers()
                return
        except Exception as e:
            # Nothing we can do, so just re-present the form.
            log.warning('save failed', exc_info=e)

        try:
            with open(HTML_FILE, 'r') as f:
                html = f.read()
            html = html.replace('isLunaLocal = false', 'isLunaLocal = true')
            self.send_response(200)
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
        except Exception as e:
            log.warning('GET failed', exc_info=e)
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))

    def do_POST(self):
        '''Save posted data from the form.'''
        data = json.loads(self.rfile.read(int(self.headers['content-length'])))
        try:
            save_config(data)
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')
        except Exception as e:
            log.warning('POST failed', exc_info=e)
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode('utf-8'))
