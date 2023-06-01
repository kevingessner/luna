from datetime import datetime, tzinfo

import geometry

azimuth_r1, azimuth_r2 = 620, 700 # TODO these are only suitable for the 1872x1404 screen
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
        indicator_r = 10
        alt_lerp = (mg.altitude / 90.0) * (azimuth_r2 - azimuth_r1 - 2 * indicator_r) + azimuth_r1 + indicator_r
        indicator_draw_commands += [
            'stroke-width 0',
            f'translate 0,{alt_lerp}',
            f'circle 0,0,0,{indicator_r}',
        ]
    return ['-draw', ' '.join(indicator_draw_commands)]

def draw_cardinal_direction(text: str, angle: int, x: int, y: int):
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
            '-fill', color, '-font', 'Helvetica', '-pointsize', '30',
            # Draw the text centered, at the center of the image, rotated appropriately.
            '-gravity', 'center',
            '-annotate', '{angle:0.1f}x{angle:0.1f}+0+0'.format(angle=angle), text,
        ')',
        # Position the center of the text image at the given position; remember positive Y is down, and ImageMagick
        # geometry requires explicit `+` and `-`.
        '-gravity', 'center',
        '-geometry', f'{x:+d}{y:+d}',
        '-composite'
    ]

