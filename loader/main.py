#!/usr/bin/env bash
"exec" "`dirname $0`/venv/bin/python" "$0" "$@"
# ^ line following shebang is magic, and results in this script running with the venv's python no matter how it is
# invoked (e.g. `./main.py`, `./loader/main.py`, `venv/bin/python main.py`).  It's a noop in python (just strings!)
# but a command in bash to replace the interpreter with the venv python.

__doc__ = '''Downloads the current moon image from NASA's dial-a-moon API,
formats it for display on the e-paper screen, then (optionally) displays it.

Pass the full e-paper display command as the first argument to trigger the display;
the image path will be appended. e.g.:
    $ ./main.py "bin/epd -1.37 1"
'''

DISPLAY_DIMENSIONS_PX = (1872, 1404)
LATITUDE = 40.8
LONGITUDE = -73.95
TIMEZONE_NAME = 'America/New_York'

CACHE_DIR = '/var/tmp/luna'
CACHE_JSON_NAME = 'dialamoon.json'
CACHE_IMAGE_NAME = 'tmp.tif'
CACHE_PROCESSED_IMAGE_NAME = 'tmp.bmp'
CACHE_FINAL_IMAGE_NAME = 'tmp-display.bmp'

import json
import logging
import os
import shlex
import subprocess
import sys
import time
import urllib.request
try:
    # Only on Python 3.9+, but not critical
    import zoneinfo
except:
    from backports import zoneinfo
TZ = zoneinfo.ZoneInfo(TIMEZONE_NAME)
from datetime import datetime, timedelta, timezone, tzinfo

import annotate
import geometry

log = logging.getLogger(__name__)

def fetch_dialamoon(dt: datetime):
    url = 'https://svs.gsfc.nasa.gov/api/dialamoon/{}'.format(dt.strftime('%Y-%m-%dT%H:%M'))
    log.info(url)
    with urllib.request.urlopen(url) as r:
        return json.load(r)

def cached_dam():
    '''Load cached dial-a-moon JSON if available, or return {}.'''
    try:
        json_path = os.path.join(CACHE_DIR, CACHE_JSON_NAME)
        log.info(f'looking for {json_path}')
        with open(json_path, 'r') as f:
            return json.load(f)
    except OSError as e:
        log.info(f'cached JSON not found', exc_info=e)
        return {}

def cache_dam(dam):
    '''Write a dial-a-moon JSON to the cache file.'''
    json_path = os.path.join(CACHE_DIR, CACHE_JSON_NAME)
    with open(json_path, 'w') as f:
        json.dump(dam, f)
    log.info(f'wrote {json_path}')

def cached_dam_image():
    dam = cached_dam()
    try:
        return dam['image']['url']
    except KeyError:
        return None

def download_image(img_url):
    img_path = os.path.join(CACHE_DIR, CACHE_IMAGE_NAME)
    with urllib.request.urlopen(img_url) as r:
        with open(img_path, 'wb') as f:
            log.info(f'downloading {img_url} to {img_path}')
            f.write(r.read())

def process_dam_image(annot: annotate.Annotate):
    input_img_path = os.path.join(CACHE_DIR, CACHE_IMAGE_NAME)
    output_img_path = os.path.join(CACHE_DIR, CACHE_PROCESSED_IMAGE_NAME)
    log.info(f'processing to {output_img_path}')
    subprocess.run(
        ('convert',
        input_img_path,
        # The moon image isn't always the same size: NASA scales it based on the apparent size of the moon at the given
        # time.  We always want the moon to be the same size on the display, so trim to just the moon, then scale it to
        # fit within the screen and within the ring of annotations.
        '-trim',
        '-resize', f'{annot.azimuth_r1*2}x{annot.azimuth_r1*2}^',
        '-contrast',
        # Center the (square) moon image on a canvas the size of the display
        '-background', '#111',
        '-gravity', 'Center',
        '-extent', '{}x{}'.format(*DISPLAY_DIMENSIONS_PX),
        # 'Gray' makes for a nice contrasty conversion to grayscale
        '-colorspace', 'Gray',
        # Stretch the lightest part of the image to white.
        '-normalize',
        '-compress', 'none',
        output_img_path,
        ),
        check = True,
    )
    log.info(f'processing complete {output_img_path}')

def annotate_dam_image(annot: annotate.Annotate):
    input_img_path = os.path.join(CACHE_DIR, CACHE_PROCESSED_IMAGE_NAME)
    output_img_path = os.path.join(CACHE_DIR, CACHE_FINAL_IMAGE_NAME)
    args = ('convert',
        input_img_path,
        *annot.draw_annotations(),
        output_img_path,
    )
    log.info(f'annotating to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'annotating complete {output_img_path}')

def display_dam_image(args):
    img_path = os.path.join(CACHE_DIR, CACHE_FINAL_IMAGE_NAME)
    args = args + [img_path]
    log.info(f'displaying {args}')
    # epd hangs occasionally. It takes <20s on a successful run,
    # so kill it after 30.  The next cycle will try again.
    subprocess.run(args, check=True, timeout=30)

if __name__ == '__main__':
    logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.INFO)

    os.makedirs(CACHE_DIR, exist_ok=True)

    utc_now = datetime.now(timezone.utc)
    dam = fetch_dialamoon(utc_now)

    mg = geometry.MoonGeometry(utc_now, LATITUDE, LONGITUDE, moon_ra=dam['j2000_ra'], moon_dec=dam['j2000_dec'])
    annot = annotate.Annotate(*DISPLAY_DIMENSIONS_PX, mg, TZ)

    last_dam_image = cached_dam_image()
    new_dam_image = dam['image']['url']
    logging.info(f'checking {new_dam_image} against {last_dam_image}')
    if new_dam_image != last_dam_image:
        # Switch to a high-res image
        # e.g. https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005048/frames/730x730_1x1_30p/moon.3478.jpg
        # to   https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005048/frames/3840x2160_16x9_30p/plain/moon.3478.tif
        new_dam_image = new_dam_image.replace('730x730_1x1_30p', '3840x2160_16x9_30p/plain').replace('.jpg', '.tif')
        logging.info('downloading new image')
        download_image(new_dam_image)
        process_dam_image(annot)

    annotate_dam_image(annot)
    if len(sys.argv) > 1:
        display_dam_image(sys.argv[1].split(' '))
    cache_dam(dam)
