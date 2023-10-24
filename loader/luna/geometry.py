import logging
import math
import typing
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from functools import cached_property

import astral
import astral.moon as astral_moon

J2000 = datetime(2000, 1, 1, 12, 0, 0, tzinfo=timezone.utc)

# Type annotations don't allow forward references, so this allows methods in MoonGeometry to reference the class itself.
T = typing.TypeVar('T', bound='MoonGeometry')

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class MoonGeometry:
    '''
    Calculates the azimuth (heading) and altitude of the moon at a particular moment, given a location on Earth and the Moon's celestial coordidates.
    Gratefully based on http://www.stargazing.net/kepler/altaz.html, and spot-checked against https://theskylive.com/planetarium?obj=moon.

    >>> mg = MoonGeometry(datetime(1998, 8, 10, 23, 10, tzinfo=timezone.utc), 52.5, -1.9166667, moon_ra=16.695, moon_dec=36.466667)
    >>> '%0.4f' % mg.local_sidereal_time
    '304.8076'
    >>> '%0.4f' % mg.hour_angle
    '54.3826'
    >>> '%0.4f' % mg.altitude
    '49.1691'
    >>> '%0.4f' % mg.azimuth
    '269.1463'

    As Hale Bopp is both an evening and morning object, try to calculate the ALT and AZ for the comet on 14th
    March 1997 for Birmingham UK at 19:00 UT. The data are given below;
    RA 22h 59.8min  DEC 42d 43min (epoch 1950, BAA comet section)
    Days 73
    Hours 1900
    Long 1d 55min West Lat 52d 30min North
    and I got
    LST = 6.367592 hrs (= 95.5139 d)
    ALT = 22.40100 d
    AZ  = 311.92258 d

    >>> mg = MoonGeometry(datetime(1997, 3, 14, 19, 00, tzinfo=timezone.utc), 52.5, -1.9166667, moon_ra=(22 + 59.8/60), moon_dec=(42 + 43/60))
    >>> '%0.4f' % mg.local_sidereal_time
    '95.5139'
    >>> '%0.4f' % mg.altitude
    '22.4010'
    >>> '%0.4f' % mg.azimuth
    '311.9226'

    >>> mg = MoonGeometry(datetime(2023, 5, 25, 21, 16, tzinfo=timezone.utc), 40.8, -73.95, moon_ra=9.2748, moon_dec=20.9167)
    >>> '%0.4f' % mg.altitude
    '68.0763'
    >>> '%0.4f' % mg.azimuth
    '151.8275'
    '''
    dt: datetime
    latitude: float # north positive, south negative
    longitude: float # east positive, west negative
    moon_ra: float # in decimal hours
    moon_dec: float # in decimal degrees

    @classmethod
    def for_datetime(cls: typing.Type[T], dt: datetime, latitude: float, longitude: float) -> T:
        pos = astral_moon.moon_position(days_since_j2000(dt))
        return cls(dt, latitude, longitude, radians_to_hours(pos.right_ascension), math.degrees(pos.declination))

    @cached_property
    def local_sidereal_time(self) -> float:
        '''In degrees.'''
        time_hours = self.dt.hour + (self.dt.minute / 60.0)
        lst = 100.46 + 0.985647 * days_since_j2000(self.dt) + self.longitude + 15 * time_hours
        return lst % 360.0

    @cached_property
    def hour_angle(self) -> float:
        '''Angle in degrees.'''
        ra_degrees = self.moon_ra * 15.0
        return (self.local_sidereal_time - ra_degrees) % 360.0

    @cached_property
    def azimuth(self) -> float:
        '''Compass angle of the moon's center, in degrees.'''
        alt = self.altitude
        cosaz = (dsin(self.moon_dec) - dsin(alt) * dsin(self.latitude)) / (dcos(alt) * dcos(self.latitude))
        az = math.degrees(math.acos(cosaz))
        if dsin(self.hour_angle) > 0:
            return 360 - az
        return az

    @cached_property
    def altitude(self) -> float:
        '''Angle in degrees of the moon's center above the horizon (or below, if negative).'''
        sinalt = dsin(self.moon_dec) * dsin(self.latitude) + dcos(self.moon_dec) * dcos(self.latitude) * dcos(self.hour_angle)
        return math.degrees(math.asin(sinalt))

    @cached_property
    def parallactic_angle(self) -> float:
        '''Angle in degrees, clockwise from vertical to celestial North.  Used to rotate the moon image appropriately for the current location and time.

        https://astronomy.stackexchange.com/a/26215
        https://astronomy.stackexchange.com/a/39166
        '''
        return math.degrees(math.atan2(
            dsin(self.hour_angle),
            dtan(self.latitude) * dcos(self.moon_dec) - dsin(self.moon_dec) * dcos(self.hour_angle)))

    @cached_property
    def nearest_rise_and_set(self) -> typing.Tuple['MoonGeometry', 'MoonGeometry']:
        '''Returns a tuple of MoonGeometry of the moon rise and moon set to be displayed: the most-recent rise if the moon
        is up at `self.dt`, otherwise the next rise; and the set following that rise.'''
        # Work in UTC for consistency.
        tz = timezone.utc
        dt = self.dt.astimezone(tz)
        loc = astral.LocationInfo('', '', tz.tzname(dt), self.latitude, self.longitude)

        try:
            rise_dt = astral_moon.moonrise(loc.observer, dt, tz)
        except ValueError:
            # astral throws in some cases when there is no rise on a given date.
            rise_dt = None
        if self.altitude > 0: # moon is up
            # Find the most-recent past moonrise, which may be yesterday.
            if rise_dt is None or rise_dt > dt:
                rise_dt = astral_moon.moonrise(loc.observer, dt - timedelta(days=1), tz)
            log.info(f'most recent rise: {rise_dt}')
        else: # moon is not up
            # Find the next moonrise, which may be tomorrow.
            if rise_dt is None or rise_dt < dt:
                rise_dt = astral_moon.moonrise(loc.observer, dt + timedelta(days=1), tz)
            log.info(f'next rise: {rise_dt}')
        assert rise_dt is not None

        # Find the following moonset, which might be the day after moonrise.
        try:
            set_dt = astral_moon.moonset(loc.observer, rise_dt, tz)
        except ValueError:
            # astral throws in some cases when there is no set on a given date.
            set_dt = None
        if set_dt is None or set_dt < rise_dt:
            set_dt = astral_moon.moonset(loc.observer, rise_dt + timedelta(days=1), tz)
        assert set_dt is not None
        log.info(f'next set: {set_dt}')

        rise_pos = astral_moon.moon_position(days_since_j2000(rise_dt))
        rise_mg = MoonGeometry(rise_dt, self.latitude, self.longitude, radians_to_hours(rise_pos.right_ascension), math.degrees(rise_pos.declination))
        set_pos = astral_moon.moon_position(days_since_j2000(set_dt))
        set_mg = MoonGeometry(set_dt, self.latitude, self.longitude, radians_to_hours(set_pos.right_ascension), math.degrees(set_pos.declination))

        return (rise_mg, set_mg)

def dsin(n: float) -> float:
    '''math.sin on a value in degrees'''
    return math.sin(math.radians(n))
def dcos(n: float) -> float:
    '''math.cos on a value in degrees'''
    return math.cos(math.radians(n))
def dtan(n: float) -> float:
    '''math.tan on a value in degrees'''
    return math.tan(math.radians(n))

def radians_to_hours(r: float) -> float:
    return math.degrees(r) / 15

def days_since_j2000(dt: datetime) -> float:
    '''Fractional days since the J2000 epoch.

    >>> '%0.4f' % days_since_j2000(datetime(2008, 4, 4, 15, 30, tzinfo=timezone.utc))
    '3016.1458'
    '''
    return (dt - J2000)/timedelta(days=1)
