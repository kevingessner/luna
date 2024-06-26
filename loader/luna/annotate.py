import logging
import typing
from datetime import datetime, timedelta, timezone, tzinfo
from functools import cached_property

from . import geometry

log = logging.getLogger(__name__)


class Annotate:
    azimuth_r1: int
    azimuth_r2: int # inner and outer radius of the azimuth line and text
    indicator_r = 10 # radius of the altitude indicator dot
    color = '#eee' # color of text, indicator, etc
    dimensions: typing.Tuple[int, int]
    half_dimensions: typing.Tuple[int, int]
    mg: geometry.MoonGeometry
    display_tz: tzinfo

    def __init__(self, display_w: int, display_h: int, mg: geometry.MoonGeometry, display_tz: tzinfo):
        # Set the radius of the ring of annotations for the display size.
        annotate_ring_width = 70
        self.azimuth_r2 = min(display_w, display_h) // 2 - 0
        self.azimuth_r1 = self.azimuth_r2 - annotate_ring_width
        self.dimensions = (display_w, display_h)
        self.half_dimensions = (display_w//2, display_h//2)
        self.mg = mg
        self.display_tz = display_tz
        self.color = _color_for_illum(mg.percent_illuminated)

    def draw_annotations(self):
        '''Returns a list of ImageMagick commands to draw all the annotations on the image.'''
        return self._draw_legend() + self._draw_grid() + self._draw_indicator() + self._draw_cardinal_directions() + self._draw_moon_path()

    def _lerp_altitude(self, altitude: float) -> float:
        '''Interpolate an altitude > 0 into the annulus between r1 and r2.'''
        outer = self.azimuth_r2 - self.indicator_r
        inner = self.azimuth_r1 + self.indicator_r
        return (altitude / 90.0) * (outer - inner) + inner

    def _can_draw_text_at_azimuth(self, az: float, *mgs: geometry.MoonGeometry, delta: float = 4) -> bool:
        '''Check if the given azimuth is "too close" to that of any of the geometries.'''
        if not mgs:
            mgs = (self.mg, *self.mg.nearest_rise_and_set)
        return _can_draw_text_at_azimuth(az, delta, [mg.azimuth for mg in mgs])

    def _draw_text(self, text: str, angle: int, x: int, y: int, text_gravity: str = 'center'):
        '''Returns ImageMagick draw commands for writing `text` tilted at `angle` at a point relative to the image center;
        positive X to the right and positive Y down.

        text_gravity: how align the text relative to the point. default is to center the text at the point; 'west' pushes the
        text left, so the right edge is at the point, etc.  The direction is always relative to the text's upright direction, not the rotated direction!'''
        # Text drawing with -draw and -annotate is broken in the ImageMagick 6.9 that comes with Raspbian.
        # Certain rotation and translation combinations are misplaced entirely,
        # e.g. `gravity center rotate 90 translate 0,600` for East is drawn incorrectly at the image center.
        # Instead, generate each label as a subimage with the rotated text,
        # and composite it into the parent image at the correct point for the angle and radius.
        bg_color = 'transparent'
        #bg_color = 'rgba(100,0,0,0.5)'
        return [
            # Subimage commands within ()
            '(',
                # Any size bigger than the bounding box of the largest label.
                '-size', '{s}x{s}'.format(s=300),
                f'xc:{bg_color}',
                '-background', bg_color,
                '-fill', self.color, '-font', 'Helvetica', '-pointsize', '30',
                # Draw the text at the center of the subimage
                '-gravity', 'center',
                '-annotate', '0x0+0+0', text,
                # Trim all background pixels, cropping the image to just the text.  Then scale by 2x;
                # this respects gravity, so the text will be now aligned to the correct edge of the image
                # for the gravity.  Now when the subimage is placed by its center, the text is aligned relative
                # to that center point. (Change `bg_color` above to an opaque color to see what's
                # happening more clearly.)
                '-trim',
                '+repage',
                '-gravity', text_gravity,
                '-extent', '200%',
                # Now rotate around the center point
                '-rotate', f'{angle:0.1f}',
                '+repage',
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
            '-pointsize', str(self.dimensions[0] // 50),
            '-gravity', 'SouthWest',
            '-draw', f'''text 20,160 "{abs(self.mg.latitude):0.1f} {'N' if self.mg.latitude >= 0 else 'S'}, {abs(self.mg.longitude):0.1f} {'E' if self.mg.longitude >= 0 else 'W'}"''',
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
        stroke_width = 3
        indicator_draw_commands = [
            f'stroke "{self.color}"',
            f'fill "{self.color}"',
            f'stroke-width {stroke_width}',
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
        else:
            alt_lerp = self._lerp_altitude(45)

        # Place the current time across the indicator line, at the dot if it's drawn or else centered.
        display_dt = self.mg.dt.astimezone(self.display_tz)
        text_rotate = self.mg.azimuth
        text_x = -geometry.dsin(self.mg.azimuth) * alt_lerp
        text_y = geometry.dcos(self.mg.azimuth) * alt_lerp
        # Move the text horizontally (relative to its baseline, so angled on the canvas) by enough to avoid the
        # indicator dot/line (plus a margin).
        text_shift = (self.indicator_r if self.mg.altitude > 0 else stroke_width) + 1
        text_shift_x = geometry.dcos(self.mg.azimuth) * text_shift
        text_shift_y = geometry.dsin(self.mg.azimuth) * text_shift
        # If drawing in the top half (from E to S to W), flip the text for upright reading.  Must invert the shifts,
        # too.
        if 90 <= self.mg.azimuth <= 270:
            text_rotate += 180
            text_shift_x = -text_shift_x
            text_shift_y = -text_shift_y

        return [
            '-draw', ' '.join(indicator_draw_commands),
            # Hours to the left of the point, minutes to the right.
            *self._draw_text(display_dt.strftime('%H'), text_rotate, text_x - text_shift_x, text_y - text_shift_y, 'west'),
            *self._draw_text(display_dt.strftime('%M'), text_rotate, text_x + text_shift_x, text_y + text_shift_y, 'east'),
        ]

    def _draw_grid(self):
        '''Returns ImageMagick commands to draw concentric rings of altitudes.'''
        draw_commands = [
            # Black line immediately around moon image to increase apparent contrast.
            '-draw', 'translate {0},{1} stroke black fill transparent stroke-width 1 circle 0,0,0,{2}'.format(
                self.half_dimensions[0], self.half_dimensions[1], self.azimuth_r1),
            # Wide white band where the mat starts, for easier development on unmatted screens.
            '-draw', 'translate {0},{1} stroke white fill transparent stroke-width {2} circle 0,0,0,{3}'.format(
                self.half_dimensions[0], self.half_dimensions[1], stroke_width := 20, min(*self.half_dimensions) + stroke_width / 2),
        ]
        # Rings at the radius of reference altitudes.
        for a in (0, 30, 60, 90):
            draw_commands += ['-draw', ' '.join([
                f'stroke "#555"',
                'fill transparent',
                'stroke-width 1',
                # Move the drawing origin to the center of the image (default is top left).
                'translate {0},{1}'.format(*self.half_dimensions),
                f'circle 0,0,0,{self._lerp_altitude(a)}',
            ])]
        return draw_commands

    def _draw_cardinal_directions(self):
        draw_commands = []
        cardinal_radius = (self.azimuth_r2 + self.azimuth_r1) / 2
        # Draw the cardinal directions around the circle, south up.
        # Text alignment is relative to the unrotated text, so push E/S/W away from the moon 'upward',
        # and N away from the moon 'downward'.
        if self._can_draw_text_at_azimuth(0):
            draw_commands += self._draw_text('N', 0, 0, cardinal_radius)
        if self._can_draw_text_at_azimuth(90):
            draw_commands += self._draw_text('E', 270, -cardinal_radius, 0)
        if self._can_draw_text_at_azimuth(180):
            draw_commands += self._draw_text('S', 0, 0, -cardinal_radius)
        if self._can_draw_text_at_azimuth(270):
            draw_commands += self._draw_text('W', 90, cardinal_radius, 0)
        return draw_commands

    def _draw_moon_path(self):
        '''Returns draw commands for a curve of the moon's position for the current day.  Starts at the rise azimuth, curves
        through the zenith azimuth and altitude, then back to the set azimuth.'''

        (rise_mg, set_mg) = self.mg.nearest_rise_and_set

        # Interpolate regularly between rise and set; these will be the knots (points) of the curve.
        times = []
        step = timedelta(hours=0.5)
        next_dt = rise_mg.dt
        while next_dt < set_mg.dt:
            times.append(next_dt)
            next_dt += step
        times.append(set_mg.dt)

        # Turn each time into a point for the moon's position at that time.  The rise will be the first point and the set
        # will be the last, with a point for every hour in between.
        points = []
        def point_for_geometry(altitude: float, azimuth: float):
            radius = self._lerp_altitude(altitude)
            return (-geometry.dsin(azimuth) * radius, geometry.dcos(azimuth) * radius)
        for t in times:
            pos_mg = geometry.MoonGeometry.for_datetime(t, self.mg.latitude, self.mg.longitude)
            log.debug(f'mg {t}: alt {pos_mg.altitude:0.2f}, az {pos_mg.azimuth:0.2f}')
            points.append(point_for_geometry(pos_mg.altitude, pos_mg.azimuth))

        points = _interpolate_control_points(points)
        debug_knots = points[0::3]
        debug_control_points_a = points[2:-2:3]
        debug_control_points_b = points[4:-4:3]
        first_point = points.pop(0)

        # Draw a curve for the moon's path between the calcuated rise and set.
        draw_commands = [
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
                # Code to help debug arc drawing: uncomment to draw knots (red) and control points/lines (blue) of the curve
                #'stroke blue',
                #*[f'circle {p[0]:.1f},{p[1]:.1f},{p[0]:.1f},{p[1]+3:.1f}' for p in debug_control_points_a + debug_control_points_b],
                #*[f'line {p1[0]:.1f},{p1[1]:.1f},{p2[0]:.1f},{p2[1]:.1f}' for (p1, p2) in zip(debug_control_points_a, debug_control_points_b)],
                #f'stroke red',
                #*[f'circle {p[0]:.1f},{p[1]:.1f},{p[0]:.1f},{p[1]+3:.1f}' for p in debug_knots],
            ]),
        ]

        text_width_delta = 8 # Enough degrees to avoid overlapping time text
        # Draw the rise time, unless it conflicts with the indicator
        if self._can_draw_text_at_azimuth(rise_mg.azimuth, self.mg, delta=text_width_delta):
            # If drawing in the top half (from E to S to W), flip the text for upright reading.  Must invert the gravity, too.
            if 90 <= rise_mg.azimuth <= 270:
                rise_text_rotate = 180
                rise_text_gravity = 'north'
            else:
                rise_text_rotate = 0
                rise_text_gravity = 'south'
            draw_commands.extend(self._draw_text(rise_mg.dt.astimezone(self.display_tz).strftime('%H:%M'), rise_mg.azimuth + rise_text_rotate, first_point[0] - 10, first_point[1], rise_text_gravity))

        # Draw the set time, unless it conflicts with the indicator
        if self._can_draw_text_at_azimuth(set_mg.azimuth, self.mg, delta=text_width_delta):
            if 90 <= set_mg.azimuth <= 270:
                set_text_rotate = 180
                set_text_gravity = 'north'
            else:
                set_text_rotate = 0
                set_text_gravity = 'south'
            draw_commands += self._draw_text(set_mg.dt.astimezone(self.display_tz).strftime('%H:%M'), set_mg.azimuth + set_text_rotate, points[-1][0] + 10, points[-1][1], set_text_gravity)

        return draw_commands


def _interpolate_control_points(points, k = 0.2):
    '''Given a list of points, returns those points with Bezier control points interpolated.

    Each input point is included in the output, with a new point before and a new point after that are the control
    points of a Bezier curve continuing through the point (except the first and last points, which have only a single
    control point after and before, respectively).

    The control points are interpolated by a linear regression along the line between the preceding and following points.
    The parameter `k` controls the strength of that regression; i.e. how far the control points are from the point.
    '''
    assert len(points) > 2
    # Start with the initial point; it is its own control point.
    interp_points = [points[0], points[0]]
    # For each point except the first and last...
    for i in range(1, len(points) - 1):
        # Find the previous, current, and next points
        pp, p, np = points[i - 1], points[i], points[i + 1]
        # Calculate the straight-line vector between the previous and next points
        dp = (np[0] - pp[0], np[1] - pp[1])
        # Calculate the two control points by adding a portion of that vector to the point, in each direction
        pcp, ncp = (p[0] - dp[0] * k, p[1] - dp[1] * k), (p[0] + dp[0] * k, p[1] + dp[1] * k)
        interp_points += [pcp, p, ncp]
    # End with the final point; it is its own control point.
    interp_points += [points[-1], points[-1]]
    return interp_points

def _can_draw_text_at_azimuth(az: float, delta: float, check_azs: typing.List[float]) -> bool:
    '''
    Returns True if `az` is within `delta` of any of `check_azs`, accounting for wrap around 360 to 0.

    >>> _can_draw_text_at_azimuth(0, 3, [0])
    False
    >>> _can_draw_text_at_azimuth(0, 3, [359, 60])
    False
    >>> _can_draw_text_at_azimuth(0, 3, [2])
    False
    >>> _can_draw_text_at_azimuth(0, 3, [357])
    True
    >>> _can_draw_text_at_azimuth(0, 3, [3])
    True

    >>> _can_draw_text_at_azimuth(359, 5, [0])
    False
    >>> _can_draw_text_at_azimuth(359, 5, [359, 60])
    False
    >>> _can_draw_text_at_azimuth(359, 5, [1])
    False
    >>> _can_draw_text_at_azimuth(359, 5, [357])
    False
    >>> _can_draw_text_at_azimuth(359, 5, [354])
    True
    >>> _can_draw_text_at_azimuth(359, 5, [5])
    True

    >>> _can_draw_text_at_azimuth(75, 3, [0, 90, 180, 135])
    True
    >>> _can_draw_text_at_azimuth(75, 3, [0, 77, 180, 135])
    False
    >>> _can_draw_text_at_azimuth(75, 3, [0, 70, 90, 300])
    True
    >>> _can_draw_text_at_azimuth(75, 3, [0, 73, 90, 300])
    False
    '''
    return not any(
            # Simple case: az is within delta of a check_az
            (caz - delta) < az < (caz + delta)
            # Corner case A: a check_az is close to 0, so the lower bound wraps around 360
            or (caz < delta and (caz - delta) % 360 < az)
            # Corner case B: a check_az is close to 360, so the upper bound wraps around 0
            or (360 - caz < delta and az < (caz + delta) % 360)
            for caz in check_azs)

def _color_for_illum(illum_pct: float) -> str:
    '''Maps the moon's illuminated percentage in [0, 100] to a text color: brighter moon, brighter color.

    >>> _color_for_illum(0) # new moon
    '#bbb'
    >>> _color_for_illum(25)
    '#bbb'
    >>> _color_for_illum(50) # first quarter / last quarter
    '#ccc'
    >>> _color_for_illum(75)
    '#ddd'
    >>> _color_for_illum(90)
    '#eee'
    >>> _color_for_illum(100) # full moon
    '#eee'
    '''
    if illum_pct <= 25:
        return '#bbb'
    if illum_pct <= 50:
        return '#ccc'
    if illum_pct <= 75:
        return '#ddd'
    return '#eee'


