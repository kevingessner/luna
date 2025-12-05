import logging
import re
import shlex
import subprocess
from datetime import datetime

log = logging.getLogger(__name__)


def _check_output_safe(*args, **kwargs) -> str:
    try:
        return subprocess.check_output(*args, **kwargs, encoding='utf-8').strip()
    except subprocess.CalledProcessError as cpe:
        return f'error: {cpe.output}'
    except Exception as e:
        return f'exception: {e}'

def debug_text(dt: datetime, msg):
    return f'''
{dt.strftime('%c')}
{_check_output_safe(['hostname'])}
{_check_output_safe(['hostname', '--all-ip-addresses'])}

{msg}
'''

def produce_debug_image(dimensions, output_img_path: str, dt: datetime, msg):
    text = debug_text(dt, msg).replace('%', '\\%').replace('\n', '\\n').strip()
    args = ('convert',
        '-background', 'white',
        '-fill', 'black',
        '-size', '{0}x{0}'.format(min(*dimensions) - 50),
        '-gravity', 'center',
        f'label:{text}',
        '-extent', '{}x{}'.format(*dimensions),
        output_img_path,
    )
    log.info(f'producing debug image to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'producing debug image complete {output_img_path}')

def produce_needs_config_image(dimensions, output_img_path: str):
    # Prints the hotspot WiFi network name and password (sudo required for the password)
    wifi_info = _check_output_safe(['sudo', 'nmcli', 'dev', 'wifi', 'show-password'])
    text = f'''Luna needs to be set up

You'll need your GPS coordinates (try https://gps-coordinates.org/)

Then connect to this Wifi network to continue:
{wifi_info}

If needed, point your browser to http://luna.setup/

{datetime.now().strftime('%c')}'''
    args = ('convert',
        'canvas:white',
        '-background', 'white',
        '-extent', '{}x{}'.format(*dimensions),
        '-gravity', 'center',
        '-fill', 'black',
        '-pointsize', '36',
        '-annotate', '+0-0', text,
        output_img_path,
    )
    log.info(f'producing debug image to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'producing debug image complete {output_img_path}')
