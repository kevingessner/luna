import base64
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
    # Set the timezone first.
    subprocess.check_call(['sudo', 'timedatectl', 'set-timezone', dt.tzinfo.key])
    # Set the system and hardware clocks.  `set-time` must be set with a local timestamp, but will store the time in UTC.
    subprocess.check_call(['sudo', 'timedatectl', 'set-time', dt.astimezone().strftime('%Y-%m-%d %H:%M:%S')])

def save_config(config):
    for name in ['latitude', 'longitude']:
        with open(os.path.join(CONFIG_DIR, name), 'w') as f:
            value = float(config[name])
            f.write(str(value))

    # date from JS comes like `2023-12-19T13:19`, in the timezone in tzcode.
    tz_code = config['tzcode']
    dt = datetime.strptime(config['datetime'], '%Y-%m-%dT%H:%M').replace(tzinfo=zoneinfo.ZoneInfo(tz_code))
    set_time(dt)
    # Trigger the image to refresh immediately
    subprocess.check_call(['sudo', 'systemctl', 'start', 'luna'])

class Handler(http.server.BaseHTTPRequestHandler):

    def do_GET(self):
        '''Serve the form.'''
        try:
            with open(HTML_FILE, 'r') as f:
                html = f.read()
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
