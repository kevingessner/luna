import logging
import math
from datetime import datetime, timedelta, timezone, tzinfo

import astral
import astral.moon as astral_moon

import geometry

log = logging.getLogger(__name__)


class Annotate:
    azimuth_r1: int
    azimuth_r2: int # inner and outer radius of the azimuth line and text
    indicator_r = 10 # radius of the altitude indicator dot
    color = '#aaa'
    display_dimensions = None
    mg: geometry.MoonGeometry = None
    display_tz: tzinfo

    def __init__(self, display_w: int, display_h: int, mg: geometry.MoonGeometry, display_tz: tzinfo):
        # Set the radius of the ring of annotations for the display size.
        annotate_ring_width = 70
        self.azimuth_r2 = min(display_w, display_h) / 2 - 2
        self.azimuth_r1 = self.azimuth_r2 - annotate_ring_width
        self.dimensions = (display_w, display_h)
        self.half_dimensions = (display_w/2, display_h/2)
        self.mg = mg
        self.display_tz = display_tz

    def draw_annotations(self):
        '''Returns a list of ImageMagick commands to draw all the annotations on the image.'''
        return self._draw_legend() + self._draw_indicator() + self._draw_cardinal_directions() + self._draw_moon_path()

    def _lerp_altitude(self, altitude: float) -> float:
        '''Interpolate an altitude > 0 into the annulus between r1 and r2.'''
        outer = self.azimuth_r2 - self.indicator_r
        inner = self.azimuth_r1 + self.indicator_r
        return (altitude / 90.0) * (outer - inner) + inner

    def _draw_text(self, text: str, angle: int, x: int, y: int, text_gravity: str = 'center'):
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
                '-fill', self.color, '-font', 'Helvetica', '-pointsize', '30',
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

    def _draw_legend(self):
        return [
            '-font', 'Helvetica',
            '-fill', self.color,
            '-pointsize', '40',
            '-gravity', 'SouthWest',
            '-draw', f'text 20,110 "Alt: {self.mg.altitude:0.1f}deg"',
            '-draw', f'text 20,60 "Az: {self.mg.azimuth:0.1f}deg"',
            '-draw', f'''text 20,10 "{self.mg.dt.astimezone(self.display_tz).strftime('%Y-%m-%d %H:%M:%S %Z')}"''',
        ]

    def _draw_indicator(self):
        # Draw azimuth and altitude as a pointer with a dot.  Direction is the azimuth with south up and east left;
        # altitude as an indicator along the pointer.
        # The pointer is a radial line between r1 and r2,
        # where r1 is just outside the moon image and r2 is just inside the edge of the display.
        # The altitude is mapped from [-90, 90] to [r1, r2],
        # such that values <= 0 are not drawn (moon not visible)
        # and values > 0 are linearly interpolated to [r1, r2], accounting for the radius of the indicator
        indicator_draw_commands = [
            f'stroke "{self.color}"',
            f'fill "{self.color}"',
            'stroke-width 3',
            # Move the drawing origin to the center of the image (default is top left).
            'translate {0},{1}'.format(*self.half_dimensions),
            f'rotate {self.mg.azimuth:0.1f}',
            f'line 0,{self.azimuth_r1},0,{self.azimuth_r2}',
        ]
        if self.mg.altitude > 0:
            alt_lerp = self._lerp_altitude(self.mg.altitude)
            indicator_draw_commands += [
                'stroke-width 0',
                f'translate 0,{alt_lerp}',
                f'circle 0,0,0,{self.indicator_r}',
            ]
        return ['-draw', ' '.join(indicator_draw_commands)]

    def _draw_cardinal_directions(self):
        draw_commands = []
        cardinal_radius = self.azimuth_r2 - 15
        cardinal_skip_angle_delta = 4
        # Draw the cardinal directions around the circle, south up.
        # Don't draw one if the pointer will overlap it (i.e. it's within a few degrees).
        if not (360 - cardinal_skip_angle_delta < self.mg.azimuth or self.mg.azimuth < cardinal_skip_angle_delta):
            draw_commands += self._draw_text('N', 0, 0, cardinal_radius)
        if not (90 - cardinal_skip_angle_delta < self.mg.azimuth < 90 + cardinal_skip_angle_delta):
            draw_commands += self._draw_text('E', 270, -cardinal_radius, 0)
        if not (180 - cardinal_skip_angle_delta < self.mg.azimuth < 180 + cardinal_skip_angle_delta):
            draw_commands += self._draw_text('S', 0, 0, -cardinal_radius)
        if not (270 - cardinal_skip_angle_delta < self.mg.azimuth < 270 + cardinal_skip_angle_delta):
            draw_commands += self._draw_text('W', 90, cardinal_radius, 0)
        return draw_commands

    def _draw_moon_path(self):
        '''Returns draw commands for a curve of the moon's position for the current day.  Starts at the rise azimuth, curves
        through the zenith azimuth and altitude, then back to the set azimuth.'''

        (rise_dt, set_dt) = self._rise_set()

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
            radius = self._lerp_altitude(altitude)
            return (-geometry.dsin(azimuth) * radius, geometry.dcos(azimuth) * radius)
        for t in times:
            pos = astral_moon.moon_position(geometry.days_since_j2000(t))
            pos_mg = geometry.MoonGeometry(t, self.mg.latitude, self.mg.longitude, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            log.debug(f'mg {t}: alt {pos_mg.altitude:0.2f}, az {pos_mg.azimuth:0.2f}')
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
                f'stroke {self.color}',
                'stroke-width 1',
                # Move the drawing origin to the center of the image (default is top left).
                'translate {0},{1}'.format(*self.half_dimensions),
                # SVG path syntax: M x1 y1 C cx1 cy1 cx2 cy2 x2 y2 cx3 cy3 cx4 cy4 x4 y4 ...
                # Start at (x1, y1); smoothly curve to (x2, y2) with control points (cx1, cy1) and (cx2, cy2),
                # then to (x3, y3) with control points (cx3, cy3) and (cx4, cy4), etc.
                f'path "M {first_point[0]:.1f} {first_point[1]:.1f} C {" ".join("%.1f" % coord for p in points for coord in p)}"',
            ]),
            *self._draw_text(rise_dt.astimezone(self.display_tz).strftime('%H:%M'), 0, first_point[0] - 10, first_point[1], 'west'),
            *self._draw_text(set_dt.astimezone(self.display_tz).strftime('%H:%M'), 0, points[-1][0] + 10, points[-1][1], 'east'),
        ]

    def _rise_set(self):
        '''Returns a tuple of datetimes of the moon rise and moon set to be displayed: the most-recent rise if the moon
        is up at `self.mg.dt`, otherwise the next rise; and the set following that rise.'''
        # Work in UTC for consistency.
        tz = timezone.utc
        dt = self.mg.dt.astimezone(tz)
        loc = astral.LocationInfo('', '', tz.tzname(dt), self.mg.latitude, self.mg.longitude)

        try:
            rise_dt = astral_moon.moonrise(loc.observer, dt, tz)
        except ValueError:
            # astral throws in some cases when there is no rise on a given date.
            rise_dt = None
        if self.mg.altitude > 0: # moon is up
            # Find the most-recent past moonrise, which may be yesterday.
            if rise_dt is None or rise_dt > dt:
                rise_dt = astral_moon.moonrise(loc.observer, dt - timedelta(days=1), tz)
            log.info(f'most recent rise: {rise_dt}')
        else: # moon is not up
            # Find the next moonrise, which may be tomorrow.
            if rise_dt is None or rise_dt < dt:
                rise_dt = astral_moon.moonrise(loc.observer, dt + timedelta(days=1), tz)
            log.info(f'next rise: {rise_dt}')

        # Find the following moonset, which might be the day after moonrise.
        try:
            set_dt = astral_moon.moonset(loc.observer, rise_dt, tz)
        except ValueError:
            # astral throws in some cases when there is no set on a given date.
            set_dt = None
        if set_dt is None or set_dt < rise_dt:
            set_dt = astral_moon.moonset(loc.observer, rise_dt + timedelta(days=1), tz)
        log.info(f'next set: {set_dt}')

        return (rise_dt, set_dt)
