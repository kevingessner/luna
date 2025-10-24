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
from luna import config
from luna import debug
from luna import geometry
from images import finder, renderer

CACHE_DIR = '/var/tmp/luna'
CACHE_FINAL_IMAGE_NAME = 'tmp-display.bmp'

log = logging.getLogger(__name__)

def annotate_image(annot: annotate.Annotate, posangle: float, input_img_path: str, output_img_path: str, addl: typing.List[str]=[]):
    '''Apply the operations and annotations for the current time, date, and moon position.'''
    args = ('convert',
        input_img_path,
        *addl,
        # Center the (square) moon image on a canvas the size of the display,
        # rotated by the "position angle" (from the ephemeris; CW) and
        # "parallactic angle" (calculated; CCW) that account for the tilt of the illuminated limb.
        '-background', '#111',
        '-gravity', 'Center',
        '-rotate', f'{annot.mg.parallactic_angle - posangle}',
        '+repage',
        '-extent', '{}x{}'.format(*annot.dimensions),
        output_img_path,
    )
    log.info(f'annotating to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'annotating complete {output_img_path}')

if __name__ == '__main__':
    def _parse_dims(s: str):
        '''
        >>> _parse_dims('123x56')
        (123, 56)
        '''
        _parse_dims.__name__ = 'dimensions' # used in argparse's error output
        (w, h) = s.split('x')
        return (int(w), int(h))

    utc_now = datetime.now(timezone.utc)
    output_img_path = os.path.join(CACHE_DIR, CACHE_FINAL_IMAGE_NAME)

    import argparse
    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument("--dimensions", metavar='WxH', help="'WxH' in pixels", default='{0}x{1}'.format(*DISPLAY_DIMENSIONS_PX), type=_parse_dims)
    parser.add_argument("--date", help="date and time in UTC", default=utc_now, type=datetime.fromisoformat)
    parser.add_argument("--output", help="full path for the output image", default=output_img_path, type=str)
    args = parser.parse_args()

    logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.INFO)

    output_img_path = args.output
    os.makedirs(os.path.dirname(output_img_path), exist_ok=True)

    # The parsed datetime will be naive (no tzinfo); make it UTC without adjusting the time.
    utc_date = args.date.replace(tzinfo=timezone.utc)
    # Get the local timezone for displaying times, or fall back to UTC.
    TZ = datetime.utcnow().astimezone().tzinfo or timezone.utc
    log.info(f'handling UTC time {utc_date} in timezone {TZ}')

    try:
        latitude, longitude = config.get_location()
        log.info(f'got location ({latitude}, {longitude})')
        mg = geometry.MoonGeometry.for_datetime(utc_date, latitude, longitude)
        annot = annotate.Annotate(*args.dimensions, mg, TZ)
        max_size = annot.max_moon_size

        (library_input_img_path, posangle) = finder.moon_image_for_datetime(mg.dt)
        annotate_image(annot, posangle, library_input_img_path, output_img_path + ".library.bmp", [
            '-filter', 'catrom', # faster and sharper than the default
            '-resize', f'{max_size}x{max_size}^',
        ])

        (rendered_input_img_path, posangle) = renderer.moon_image_for_datetime(mg.dt, os.path.join(CACHE_DIR, "tmp-rendered.png"), int(max_size))
        annotate_image(annot, posangle, rendered_input_img_path, output_img_path + ".rendered.bmp", [
                # Trim off the extra bottom of the image.
                '-background', 'transparent',
                '-gravity', 'north',
                '-extent', '%dx%d' % (max_size, max_size),
                # Increase the contrast for better display on the 16-color display.
               # '-contrast',
                # 'Gray' makes for a nice contrasty conversion to grayscale
                '-colorspace', 'Gray',
                # Stretch the lightest part of the image to white, and increase the gamma to lighten the dark parts of the moon
                # without blowing out the light parts.
                #'-gamma', '1.3',
               # '-auto-level',
            ])
    except config.LunaNeedsConfigException as e:
        log.error('not configured', exc_info=e)
        # If we are running on the command line, just print the error and be done.
        if len(sys.argv) > 1:
            debug.produce_needs_config_image(args.dimensions, output_img_path)
        else:
            sys.exit(1)
    except:
        log.error('failed', exc_info=True)
