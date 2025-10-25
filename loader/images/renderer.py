import logging
import os
import shlex
import socketserver
import subprocess
import typing
import urllib.parse
from contextlib import contextmanager
from datetime import datetime

from . import ephemeris, libraries


ASSET_DIR = os.path.join(os.path.dirname(__file__), 'renderer')


log = logging.getLogger(__name__)

@contextmanager
def _serve_assets():
    port = 8888
    try:
        proc = subprocess.Popen(["python3", '-m', 'http.server', '-d', ASSET_DIR, str(port)])
        log.info('serving')
        yield f'http://127.0.0.1:{port}'
        log.info('served')
    finally:
        log.info('terminating server')
        proc.terminate()
        log.info('terminated server')

def _render_to_path(moon_info: libraries.MoonImageInfo, path: str, size: int):
    # TODO serve files in python
    # TODO pass params via URL
    with _serve_assets() as base_url:
        url = base_url + '?' + urllib.parse.urlencode(dict(
            subearth_lat=moon_info.subearth[0],
            subearth_lon=moon_info.subearth[1],
            subsolar_lat=moon_info.subsolar[0],
            subsolar_lon=moon_info.subsolar[1],
        ))
        browser = ('google-chrome',) if os.environ.get('DISPLAY') else ('xvfb-run', 'chromium')
        args = browser + (
            '--screenshot=' + path,
            '--headless=new',
            '--no-first-run',
            '--hide-scrollbars',
            # add a margin to the bottom of the image to avoid a chromium bug:
            # https://issues.chromium.org/issues/405165895
            # This will be trimmed off during processing by imagemagick.
            '--screen-info={' + str(size) + 'x' + str(size+200) + '}',
            f'--window-size={size},{size+200}',
            '--default-background-color=00000000',
            '--ignore-gpu-blocklist',
            url
        )
        log.info(f'rendering:\n{shlex.join(args)}')
        try:
            proc = subprocess.run(args, check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            log.error('process failed:\n'+ e.stdout.decode() + '\n' + e.stderr.decode(), exc_info=e)
            raise
    log.info(f'rendering complete:\n{proc.stdout}\n{proc.stderr}')


def moon_image_for_datetime(dt: datetime, path: str, size: int) -> typing.Tuple[str, float]:
    target = ephemeris.moon_eph_for_datetime(dt)
    log.info(f'ephemeris data:')
    log.info(f'  phase: {target.phase}')
    log.info(f'  subearth: {target.subearth}')
    log.info(f'  subsolar: {target.subsolar}')
    log.info(f'  posangle: {target.posangle}')
    _render_to_path(target, path, size)
    return (path, target.posangle)
