import bisect
import logging
import os
import typing
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import astral.moon

from . import libraries


__all__ = ('moon_eph_for_datetime')

log = logging.getLogger(__name__)

DATA_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'ephemeris')


def _moon_age(dt: datetime):
    '''Age of the moon as days since the last new moon, matching NASA's mooninfo files.'''
    # Map astral's [0, 28) phase to a [0, 29.5) age.
    return astral.moon.phase(dt) / 28 * 29.5


def _consume(eph, expected_prefix: str):
    i, l = next(eph)
    assert l.startswith(expected_prefix), f'parse error on line {i+1}: missing "{expected_prefix}" on "{l}"'


def _find_field(fields: typing.List[str], field_name: str) -> int:
    field = fields.index(field_name)
    assert field >= 0, f'missing {field_name} in {fields}'
    return field


def seek(eph_lines: typing.Iterable[str], dt: datetime) -> libraries.MoonImageInfo:
    eph = enumerate(eph_lines)
    for i, l in eph:
        if l.startswith('Table format'):
            break
    _consume(eph, '***')

    _, fields_header = next(eph)
    fields = [f.strip() for f in fields_header.split(',')]
    subearth_lat_field = _find_field(fields, 'ObsSub-LAT')
    subearth_lon_field = _find_field(fields, 'ObsSub-LON')
    posangle_field = _find_field(fields, 'NP.ang')
    illu_pct_field = _find_field(fields, 'Illu%')

    _consume(eph, '***')
    _consume(eph, '$$SOE')
    seek_dt = dt.replace(minute=0, second=0)
    if dt.minute >= 30:
        seek_dt += timedelta(hours=1)
    dt_str = seek_dt.strftime(' %Y-%b-%d %H:%M')
    for i, l in eph:
        if l.startswith(dt_str):
            values = [s.strip() for s in l.split(',')]
            raw_lon = float(values[subearth_lon_field])
            lon = raw_lon if raw_lon < 180 else raw_lon - 360
            return libraries.MoonImageInfo(
                time=str(seek_dt),
                phase=float(values[illu_pct_field]),
                age=_moon_age(seek_dt),
                subearth=(float(values[subearth_lat_field]), lon),
                posangle=float(values[posangle_field]),
            )
    raise ValueError(f'did not find date in ephemeris: {dt}')


def moon_eph_for_datetime(dt: datetime) -> libraries.MoonImageInfo:
    path = os.path.join(DATA_DIR, f'{dt:%Y}.txt')
    try:
        with open(path, 'r') as f:
            return seek(f, dt)
    except FileNotFoundError:
        raise ValueError(f'no ephemeris file {path} for {dt}')
