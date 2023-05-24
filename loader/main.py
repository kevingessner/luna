#!/usr/bin/env python3

'''Downloads the current moon image from NASA to `tmp.jpg` in the current directory.'''

import json
import time
import urllib.request

url = 'https://svs.gsfc.nasa.gov/api/dialamoon/{}'.format(time.strftime('%Y-%m-%dT%H:%M', time.gmtime()))
print(url)
with urllib.request.urlopen(url) as r:
    j = json.load(r)
    img_url = j['image']['url']
with urllib.request.urlopen(img_url) as r:
    with open('tmp.jpg', 'wb') as f:
        f.write(r.read())
