'''
Downloads an entire year of high-res moon images from NASA, along with a JSON file describing them.

Only needs to be run once during development, or to add additional years of data.

Requires `curl` and `parallel` in your PATH, and 50+GB of storage space + ~35GB of download bandwidth, per year processed.
'''

import logging
import json
import os
import shlex
import subprocess
import sys
import typing
import urllib.request
from tempfile import NamedTemporaryFile

from images import libraries

log = logging.getLogger(__name__)


def targets_missing_files(lib: libraries.Library, extension: str) -> typing.List[libraries.MoonImageInfo]:
    for target in lib.available_targets:
        try:
            ok = os.stat(lib.image_path(target, extension)).st_size > 0
        except FileNotFoundError:
            ok = False
        if not ok:
            yield target


def fetch_library(lib: libraries.Library):
    log.info(f'{lib.name}: fetching library JSON into {lib.library_dir}')
    os.makedirs(lib.library_dir, exist_ok=True)
    with urllib.request.urlopen(lib.json_url) as r:
        with open(lib.json_path, 'wb') as f:
            f.write(r.read())

    # For idempotency, only process targets that have no downloaded image or an empty image (something failed)
    targets = targets_missing_files(lib, 'tif')

    with NamedTemporaryFile(mode='w') as f:
        log.info(f'{lib.name}: checking for missing/empty images in {lib.library_dir}')
        c = 0
        for target in targets:
            args = (
                'curl',
                '--location', # follow redirects
                '--remote-name', # save downloaded files with their existing name
                '--retry', '3', # for resilience
                '--retry-connrefused',
                '--fail',
                '--show-error',
                lib.image_url(target),
            )
            c += 1
            f.write(shlex.join(args) + '\n')
        f.flush()
        log.info(f'{lib.name}: downloading {c} images to {lib.library_dir}')
        if c > 0:
            parallel_args = (
                'parallel',
                '--verbose',
                '--arg-file', f.name,
            )
            # curl downloads to its cwd
            subprocess.run(parallel_args, check=True, cwd=lib.library_dir)

    # Pre-process the downloaded images, so they are smaller and more easily consumed.  Do this with `parallel` so
    # it uses all CPUs.
    targets = targets_missing_files(lib, 'png')
    with NamedTemporaryFile(mode='w') as f:
        c = 0
        for target in targets:
            args = ('convert',
                lib.image_path(target, "tif"),
                '-background', 'transparent',
                # Rotate to undo the position angle, so lunar north is up.  The image will be rotated back to the needed
                # angle when it is loaded for display.
                '-rotate', f'{target.posangle:0.2f}',
                # The moon image isn't always the same size: NASA scales it based on the apparent size of the moon at the given
                # time.  We always want the moon to be the same size on the display, so trim to just the moon.
                '-trim',
                '+repage',
                '-resize', 'x1404',
                # Increase the contrast for better display on the 16-color display.
                '-contrast',
                # 'Gray' makes for a nice contrasty conversion to grayscale
                '-colorspace', 'Gray',
                # Stretch the lightest part of the image to white, and increase the gamma to lighten the dark parts of the moon
                # without blowing out the light parts.
                '-gamma', '1.5',
                '-auto-level',
                # High 'quality' for PNG means high compression.
                '-quality', '95',
                lib.image_path(target)
            )
            c += 1
            f.write(shlex.join(args) + '\n')
        f.flush()
        log.info(f'{lib.name}: processing {c} image(s) in {lib.library_dir} {f.name}')
        if c > 0:
            parallel_args = (
                'parallel',
                '--verbose',
                '--arg-file', f.name,
            )
            subprocess.run(parallel_args, check=True)

    # Re-check for any missing targets.
    missing = list(targets_missing_files(lib, 'png'))
    if len(missing) == 0:
        log.info(f'{lib.name}: done')
        log.info(f'{lib.name}: you may want to delete `{os.path.join(lib.library_dir, "moon.*.tif")}`')
    else:
        log.info(f'{lib.name}: done, with {len(missing)} image(s) are incomplete')
        log.info(f'{lib.name}: you may want run this again')


if __name__ == '__main__':
    import doctest
    doctest.testmod(report=True)

    logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.INFO)

    libs = {lib.name: lib for lib in libraries.LIBRARIES}
    lib = libs.get(sys.argv[1] if len(sys.argv) > 1 else None)
    while not lib:
        name = input(f'choose a library to build: {",".join(libs)} ')
        lib = libs.get(name)
    log.info(f'building library {lib.name}')
    fetch_library(lib)
