import logging
import math
from datetime import datetime, timedelta, timezone, tzinfo

import astral
import astral.moon as astral_moon

import geometry

log = logging.getLogger(__name__)

azimuth_r1, azimuth_r2 = 620, 700 # inner and outer radius of the azimuth line and text. TODO these are only suitable for the 1872x1404 screen
indicator_r = 10 # radius of the altitude indicator dot
color = '#aaa'

def draw_legend(dt: datetime, tz: tzinfo, mg: geometry.MoonGeometry):
    return [
        '-font', 'Helvetica',
        '-fill', color,
        '-pointsize', '40',
        '-gravity', 'SouthWest',
        '-draw', f'''text 20,110 "{dt.astimezone(tz).strftime('%H:%M:%S')}"''',
        '-draw', f'text 20,60 "Alt: {mg.altitude:0.1f}deg"',
        '-draw', f'text 20,10 "Az: {mg.azimuth:0.1f}deg"',
    ]

def _lerp_altitude(altitude: float) -> float:
    '''Interpolate an altitude > 0 into the annulus between r1 and r2.'''
    return (altitude / 90.0) * (azimuth_r2 - azimuth_r1 - 2 * indicator_r) + azimuth_r1 + indicator_r

def draw_indicator(half_dimensions, mg: geometry.MoonGeometry):
    # Draw azimuth and altitude as a pointer with a dot.  Direction is the azimuth with south up and east left;
    # altitude as an indicator along the pointer.
    # The pointer is a radial line between r1 and r2,
    # where r1 is just outside the moon image and r2 is just inside the edge of the display.
    # The altitude is mapped from [-90, 90] to [r1, r2],
    # such that values <= 0 are not drawn (moon not visible)
    # and values > 0 are linearly interpolated to [r1, r2], accounting for the radius of the indicator
    indicator_draw_commands = [
        f'stroke "{color}"',
        f'fill "{color}"',
        'stroke-width 3',
        # Move the drawing origin to the center of the image (default is top left).
        'translate {0},{1}'.format(*half_dimensions),
        f'rotate {mg.azimuth:0.1f}',
        f'line 0,{azimuth_r1},0,{azimuth_r2}',
    ]
    if mg.altitude > 0:
        alt_lerp = _lerp_altitude(mg.altitude)
        indicator_draw_commands += [
            'stroke-width 0',
            f'translate 0,{alt_lerp}',
            f'circle 0,0,0,{indicator_r}',
        ]
    return ['-draw', ' '.join(indicator_draw_commands)]

def draw_text(text: str, angle: int, x: int, y: int, text_gravity: str = 'center'):
    '''Returns ImageMagick draw commands for writing `text` tilted at `angle` at a point relative to the image center;
    positive X to the right and positive Y down.

    text_gravity: align the text relative to the point. default is to center the text at the point; 'west' pushes the
    text left, so the right edge is at the point, etc.'''
    # Text drawing with -draw and -annotate is broken in the ImageMagick 6.9 that comes with Raspbian.
    # Certain rotation and translation combinations are misplaced entirely,
    # e.g. `gravity center rotate 90 translate 0,600` for East is drawn incorrectly at the image center.
    # Instead, generate each label as a subimage with the rotated text,
    # and composite it into the parent image at the correct point for the angle and radius.
    return [
        # Subimage commands within ()
        '(',
            # Any size bigger than the bounding box of the largest label.
            '-size', '{s}x{s}'.format(s=300),
            'xc:transparent',
            '-background', 'transparent',
            '-fill', color, '-font', 'Helvetica', '-pointsize', '30',
            # Draw the text angled, at the center of the subimage, rotated appropriately.
            '-gravity', 'center',
            '-annotate', '{angle:0.1f}x{angle:0.1f}+0+0'.format(angle=angle), text,
            # Trim all background pixels, cropping the image to just the text.  Then scale by 2x;
            # this respects gravity, so the text will be now aligned to the correct edge of the image
            # for the gravity.  Now when the subimage is placed by its center, the text is aligned relative
            # to that center point. (Change the two "transparent"s above to an opaque color to see what's
            # happening more clearly.)
            '-trim',
            '+repage',
            '-gravity', text_gravity,
            '-extent', '200%',
        ')',
        # Position the center of the text image at the given position; remember positive Y is down, and ImageMagick
        # geometry requires explicit `+` and `-`.
        '-gravity', 'center',
        '-geometry', f'{int(x):+d}{int(y):+d}',
        '-composite'
    ]

def draw_moon_path(half_dimensions, dt: datetime, display_tz: tzinfo, mg: geometry.MoonGeometry):
    '''Returns draw commands for a curve of the moon's position for the current day.  Starts at the rise azimuth, curves
    through the zenith azimuth and altitude, then back to the set azimuth.'''

    # Work in UTC for consistency.
    tz = timezone.utc
    loc = astral.LocationInfo('', '', tz.tzname(dt), mg.latitude, mg.longitude)
    pos = astral_moon.moon_position(geometry.days_since_j2000(dt))

    try:
        rise_dt = astral_moon.moonrise(loc.observer, dt, tz)
    except ValueError:
        rise_dt = None
    if mg.altitude > 0: # moon is up
        # Find the most-recent past moonrise, which may be yesterday.
        if rise_dt is None or rise_dt > dt:
            rise_dt = astral_moon.moonrise(loc.observer, dt + timedelta(days=1), tz)
        log.info(f'most recent rise: {rise_dt}')
    else: # moon is not up
        # Find the next moonrise, which may be tomorrow.
        if rise_dt is None or rise_dt < dt:
            rise_dt = astral_moon.moonrise(loc.observer, dt + timedelta(days=1), tz)
        log.info(f'next rise: {rise_dt}')

    # Find the next moonset, which might be tomorrow.
    set_dt = astral_moon.moonset(loc.observer, dt, tz)
    if set_dt is None or set_dt < rise_dt:
        set_dt = astral_moon.moonset(loc.observer, dt + timedelta(days=1), tz)
    log.info(f'next set: {set_dt}')

    # Interpolate every hour between rise and set; these will be the points of the curve.
    times = []
    step = timedelta(hours=1)
    next_dt = rise_dt
    while next_dt < set_dt:
        times.append(next_dt)
        next_dt += step
    times.append(set_dt)

    # Turn each time into a point for the moon's position at that time.  The rise will be the first point and the set
    # will be the last, with a point for every hour in between.
    points = []
    last_pos_mg = None
    def point_for_geometry(altitude: float, azimuth: float):
        radius = _lerp_altitude(altitude)
        return (-geometry.dsin(azimuth) * radius, geometry.dcos(azimuth) * radius)
    for t in times:
        pos = astral_moon.moon_position(geometry.days_since_j2000(t.astimezone(tz)))
        ra_hours = math.degrees(pos.right_ascension) / 15
        pos_mg = geometry.MoonGeometry(t, mg.latitude, mg.longitude, ra_hours, math.degrees(pos.declination))
        log.info(f'mg {t}: alt {pos_mg.altitude:0.2f}, az {pos_mg.azimuth:0.2f}')
        if last_pos_mg is not None:
            # Calculate the control point for the bezier curve, by interpolating the altitude and azimuth of the current
            # and previous points.  Simple interpolation by averaging the altitude and the azimuth; empirically,
            # stretching the altitude out a bit makes for a smoother curve.
            control_point = point_for_geometry(((last_pos_mg.altitude + pos_mg.altitude) / 2) * 1.15, (last_pos_mg.azimuth + pos_mg.azimuth) / 2)
            # The control point will be used twice (for both the previous point and the next point),
            # so it needs to be added twice in the coordinates list.
            points.append(control_point)
            points.append(control_point)
        points.append(point_for_geometry(pos_mg.altitude, pos_mg.azimuth))
        last_pos_mg = pos_mg
    first_point = points.pop(0)

    # Draw a curve for the moon's path between the calcuated rise and set.
    return [
        '-draw', ' '.join([
            'fill transparent',
            f'stroke {color}',
            'stroke-width 1',
            # Move the drawing origin to the center of the image (default is top left).
            'translate {0},{1}'.format(*half_dimensions),
            # SVG path syntax: M x1 y1 C cx1 cy1 cx2 cy2 x2 y2 cx3 cy3 cx4 cy4 x4 y4 ...
            # Start at (x1, y1); smoothly curve to (x2, y2) with control points (cx1, cy1) and (cx2, cy2),
            # then to (x3, y3) with control points (cx3, cy3) and (cx4, cy4), etc.
            f'path "M {first_point[0]:.1f} {first_point[1]:.1f} C {" ".join("%.1f" % coord for p in points for coord in p)}"',
        ]),
        *draw_text(rise_dt.astimezone(display_tz).strftime('%H:%M'), 0, first_point[0] - 10, first_point[1], 'west'),
        *draw_text(set_dt.astimezone(display_tz).strftime('%H:%M'), 0, points[-1][0] + 10, points[-1][1], 'east'),
    ]
