'''
Find an image of the moon from the library of saved images.  Uses a saved ephemeris of the moon's position to find an
image that has a similar position and thus appearance.
'''

import logging
import math
import typing
from datetime import datetime

from . import libraries
from . import ephemeris


log = logging.getLogger(__name__)


def phase_distance(a, b):
    return abs(a - b)

def lat_lon_distance(a, b):
    '''Distance between two (lat, lon) tuples, as the straight-line distance between them on the plane.

    This is not properly accurate as the distance on a sphere, but is close enough, especially as we
    really only care about the pairs that are close together.'''
    d = math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2)
    return d


def candidates(target: libraries.MoonImageInfo, available: typing.List[libraries.MoonImageInfo]) -> typing.List[libraries.MoonImageInfo]:
    '''Filter `available` to those images that are closest in appearance to the `target`'s moon data.'''
    phase_delta = 0.5 # only consider candidates where the phase difference is small enough to not be noticeable
    age_delta = 1 # only consider candidates from the same part of the cycle:
                  # e.g. phase=55 happens twice per cycle, when the moon is 55% illuminated during waxing and waning, and we want to match that.
    candidates = [d for d in available
                  if target.phase - phase_delta <= d.phase <= target.phase + phase_delta
                  and target.age - age_delta <= d.age <= target.age + age_delta]
    # The best candidates are the ones that are closest in appearance to the requested date:
    # the smallest difference in phase and in libration (i.e. the same "subearth" point on the moon, the point facing earth).
    return sorted(candidates, key=lambda m: phase_distance(target.phase, m.phase) + lat_lon_distance(target.subearth, m.subearth))[:5]


def moon_image_for_datetime(dt: datetime) -> typing.Tuple[str, float]:
    '''Return the image of the moon for the given datetime.'''
    available = [target for lib in libraries.LIBRARIES for target in lib.available_targets]
    target = ephemeris.moon_eph_for_datetime(dt)
    best = candidates(target, available)[0]
    assert best.library, f'best candidate did not come from library! {best}'
    log.info(f'best image candidate: {best.time}')
    log.info(f'  phase: {best.phase} vs {target.phase} ({phase_distance(target.phase, best.phase)})')
    log.info(f'  subearth: {best.subearth} vs {target.subearth} ({lat_lon_distance(target.subearth, best.subearth)})')
    return (best.library.image_path(best), target.posangle)
