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

import logging
import os
import shlex
import subprocess
import sys
import time
import traceback
import typing
from datetime import datetime, timedelta, timezone

from luna import annotate
from luna import debug
from luna import geometry
from images import finder

CACHE_DIR = '/var/tmp/luna'
CACHE_FINAL_IMAGE_NAME = 'tmp-display.bmp'

log = logging.getLogger(__name__)

def annotate_image(annot: annotate.Annotate, posangle: float, input_img_path: str, output_img_path: str):
    '''Apply the operations and annotations for the current time, date, and moon position.'''
    # Fit the image not just in the screen but inside the inner ring of annotations.
    max_size = annot.azimuth_r1 * 2
    args = ('convert',
        input_img_path,
        '-resize', f'{max_size}x{max_size}^',
        # Center the (square) moon image on a canvas the size of the display,
        # rotated by the "position angle" (from the ephemeris; CW) and
        # "parallactic angle" (calculated; CCW) that account for the tilt of the illuminated limb.
        '-background', '#111',
        '-gravity', 'Center',
        '-rotate', f'{annot.mg.parallactic_angle - posangle}',
        '+repage',
        '-extent', '{}x{}'.format(*DISPLAY_DIMENSIONS_PX),
        *annot.draw_annotations(),
        output_img_path,
    )
    log.info(f'annotating to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'annotating complete {output_img_path}')

def display_image(img_path: str, args):
    args = args + [img_path]
    log.info(f'displaying {args}')
    # epd hangs occasionally. It takes <20s on a successful run,
    # so kill it after 30.  The next cycle will try again.
    subprocess.run(args, check=True, timeout=30)

if __name__ == '__main__':
    logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.INFO)

    os.makedirs(CACHE_DIR, exist_ok=True)

    # Get the local timezone for displaying times, or fall back to UTC.
    TZ = datetime.utcnow().astimezone().tzinfo or timezone.utc

    utc_now = datetime.now(timezone.utc) - timedelta(hours=0)
    output_img_path = os.path.join(CACHE_DIR, CACHE_FINAL_IMAGE_NAME)
    try:
        mg = geometry.MoonGeometry.for_datetime(utc_now, LATITUDE, LONGITUDE)
        annot = annotate.Annotate(*DISPLAY_DIMENSIONS_PX, mg, TZ)
        (input_img_path, posangle) = finder.moon_image_for_datetime(mg.dt)
        annotate_image(annot, posangle, input_img_path, output_img_path)
    except:
        debug.produce_debug_image(DISPLAY_DIMENSIONS_PX, output_img_path, utc_now, ''.join(traceback.format_exc(chain=False, limit=5)))

    if len(sys.argv) > 1:
        display_image(output_img_path, sys.argv[1].split(' '))
