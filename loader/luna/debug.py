import logging
import os
import re
import shlex
import subprocess
from datetime import datetime

log = logging.getLogger(__name__)


hotspot_png = os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', 'config', 'hotspot.png')


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
    size = min(*dimensions) - 400
    args = ('convert',
        '-background', 'white',
        hotspot_png,
        '-sample', f'{size}x{size}',
        '-gravity', 'center',
        '-extent', '{}x{}'.format(*dimensions),
        '-fill', 'black',
        '-pointsize', '36',
        '-annotate', f'+0-{size/2+10}', 'Luna needs to be set up',
        '-annotate', f'+0+{size/2+10}', _check_output_safe(['nmcli', 'dev', 'wifi', 'show']) + '\nhttp://luna.local\n' + datetime.now().strftime('%c'),
        output_img_path,
    )
    log.info(f'producing debug image to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'producing debug image complete {output_img_path}')
