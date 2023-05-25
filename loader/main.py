#!/usr/bin/env python3

'''Downloads the current moon image from NASA's dial-a-moon API,
formats it for display on the e-paper screen, then (optionally) displays it.

Pass the full e-paper display command as the first argument to trigger the display;
the image path will be appended. e.g.:
    $ ./main.py "bin/epd -1.37 1"
'''

DISPLAY_DIMENSIONS_PX = '1872x1404'
CACHE_DIR = '/var/tmp/luna'
CACHE_JSON_NAME = 'dialamoon.json'
CACHE_IMAGE_NAME = 'tmp.jpg'
CACHE_PROCESSED_IMAGE_NAME = 'tmp.bmp'
CACHE_FINAL_IMAGE_NAME = 'tmp-display.bmp'

import json
import logging
import os
import subprocess
import sys
import time
import urllib.request

logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.INFO)
log = logging.getLogger(__name__)

def fetch_dialamoon(t):
    url = 'https://svs.gsfc.nasa.gov/api/dialamoon/{}'.format(time.strftime('%Y-%m-%dT%H:%M', t))
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

def process_dam_image():
    input_img_path = os.path.join(CACHE_DIR, CACHE_IMAGE_NAME)
    output_img_path = os.path.join(CACHE_DIR, CACHE_PROCESSED_IMAGE_NAME)
    log.info(f'processing to {output_img_path}')
    subprocess.run(
        ('convert',
        input_img_path,
        '-resize', DISPLAY_DIMENSIONS_PX,
        '-background', 'black',
        '-gravity', 'Center',
        '-extent', DISPLAY_DIMENSIONS_PX,
        '-colorspace', 'LinearGray',
        '-normalize',
        '-compress', 'none',
        output_img_path,
        ),
        check = True,
    )
    log.info(f'processing complete {output_img_path}')

def annotate_dam_image(t):
    input_img_path = os.path.join(CACHE_DIR, CACHE_PROCESSED_IMAGE_NAME)
    output_img_path = os.path.join(CACHE_DIR, CACHE_FINAL_IMAGE_NAME)
    args = ('convert',
        input_img_path,
        '-gravity', 'West',
        '-font', 'Helvetica',
        '-fill', 'white',
        '-pointsize', '40',
        '-draw', f'''text 0,0 "{time.strftime('%H:%M:%S', t)}"''',
        output_img_path,
    )
    log.info(f'annotating to {output_img_path}:\n{" ".join(args)}')
    subprocess.run(args, check = True)
    log.info(f'annotating complete {output_img_path}')

def display_dam_image(args):
    img_path = os.path.join(CACHE_DIR, CACHE_FINAL_IMAGE_NAME)
    args = args + [img_path]
    log.info(f'displaying {args}')
    subprocess.run(args, check = True)

if __name__ == '__main__':
    os.makedirs(CACHE_DIR, exist_ok=True)

    dam = fetch_dialamoon(time.gmtime())
    last_dam_image = cached_dam_image()
    new_dam_image = dam['image']['url']
    logging.info(f'checking {new_dam_image} against {last_dam_image}')
    if new_dam_image != last_dam_image:
        logging.info('downloading new image')
        download_image(new_dam_image)
        process_dam_image()

    annotate_dam_image(time.localtime())
    if len(sys.argv) > 1:
        display_dam_image(sys.argv[1].split(' '))
    cache_dam(dam)
