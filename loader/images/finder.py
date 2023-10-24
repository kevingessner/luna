import json
import logging
import os
import shlex
import subprocess
import typing
import urllib.error
import urllib.request
from contextlib import contextmanager
from datetime import datetime

CACHE_JSON_NAME = 'dialamoon.json'
CACHE_IMAGE_NAME = 'tmp.tif'
CACHE_PROCESSED_IMAGE_NAME = 'tmp.bmp'

log = logging.getLogger(__name__)

@contextmanager
def _fetch_with_retries(url: str, *, retries: typing.List[int]):
    '''GET the given URL with `urllib.request.urlopen`, retrying `URLError`s after a succession of delays.'''
    while True:
        try:
            with urllib.request.urlopen(url) as r:
                yield r
            break
        except urllib.error.URLError as e:
            if not retries:
                raise
            t = retries.pop(0)
            log.info(f'retrying {len(retries) + 1}x more in {t}s, after error', exc_info=e)
            time.sleep(t)

def fetch_dialamoon(dt: datetime):
    url = 'https://svs.gsfc.nasa.gov/api/dialamoon/{}'.format(dt.strftime('%Y-%m-%dT%H:%M'))
    log.info(url)
    with _fetch_with_retries(url, retries=[1, 3, 15]) as r:
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
    with _fetch_with_retries(img_url, retries=[1, 3, 15]) as r:
        with open(img_path, 'wb') as f:
            log.info(f'downloading {img_url} to {img_path}')
            f.write(r.read())
    return img_path

def process_dam_image(max_size: int, input_img_path: str, output_img_path: str):
    '''Pre-process the raw moon image: apply scaling and re-coloring,
    the operations that aren't tied to the current time or moon position.'''
    args = ('convert',
        input_img_path,
        # The moon image isn't always the same size: NASA scales it based on the apparent size of the moon at the given
        # time.  We always want the moon to be the same size on the display, so trim to just the moon, then scale it to
        # fit within the screen.
        '-trim',
        '-resize', f'{max_size}x{max_size}^',
        # Increase the contrast for better display on the 16-color display.
        '-contrast',
        # 'Gray' makes for a nice contrasty conversion to grayscale
        '-colorspace', 'Gray',
        # Stretch the lightest part of the image to white, and increase the gamma to lighten the dark parts of the moon
        # without blowing out the light parts.
        '-gamma', '1.5',
        '-auto-level',
        output_img_path,
    )
    log.info(f'processing to {output_img_path}:\n{shlex.join(args)}')
    subprocess.run(args, check=True)
    log.info(f'processing complete {output_img_path}')
    return output_img_path

def moon_image_for_datetime(dt: datetime, max_size: int) -> str:
    '''Return the image of the moon for the given datetime, scaled to at most `max_size` pixels.'''
    dam = fetch_dialamoon(dt)
    last_dam_image = cached_dam_image()
    new_dam_image = dam['image']['url']
    logging.info(f'checking {new_dam_image} against {last_dam_image}')
    output_img_path = os.path.join(CACHE_DIR, CACHE_PROCESSED_IMAGE_NAME)
    if new_dam_image != last_dam_image:
        # Switch to a high-res image
        # e.g. https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005048/frames/730x730_1x1_30p/moon.3478.jpg
        # to   https://svs.gsfc.nasa.gov/vis/a000000/a005000/a005048/frames/3840x2160_16x9_30p/plain/moon.3478.tif
        new_dam_image = new_dam_image.replace('730x730_1x1_30p', '3840x2160_16x9_30p/plain').replace('.jpg', '.tif')
        logging.info('downloading new image')
        downloaded_img = download_image(new_dam_image)
        process_dam_image(max_size, downloaded_img, output_img_path)
    cache_dam(dam)
    return output_img_path
