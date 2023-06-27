#!/usr/bin/env venv/bin/python

import math
import unittest
from datetime import datetime, timedelta, timezone, tzinfo

import astral.moon as astral_moon

import annotate
import geometry

class AnnotateTest(unittest.TestCase):
    def test_astral_year(self):
        '''Ensure the moon rise/set logic works on a large number of days without errors.'''
        start_dt = datetime(2023, 6, 1, tzinfo=timezone.utc)
        for days in range(365):
            dt = start_dt + timedelta(days=days)
            with self.subTest(dt=dt, days=days):
                pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
                mg = geometry.MoonGeometry(dt, 40, -70, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
                a = annotate.Annotate(1872, 1404, mg, timezone.utc)
                a._draw_moon_path()

    def test_astral_rise_set(self):
        '''Test a variety of cases of rises and sets; confirmed against https://www.timeanddate.com/moon/uk/london?month=1&year=2023,
        with some one-minute errors due to imprecision/refaction'''

        with self.subTest("moon is up; rise and set on current day"):
            dt = datetime(2023, 1, 20, 12, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertGreater(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 20, 7, 22, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 20, 14, 11, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is not up; rise and set on current day"):
            dt = datetime(2023, 1, 20, 3, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 20, 7, 22, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 20, 14, 11, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is up; rise on previous day, set on current day"):
            dt = datetime(2023, 1, 14, 1, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertGreater(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 13, 23, 21, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 14, 11, 6, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is up; rise on current day, set on next day"):
            dt = datetime(2023, 1, 12, 23, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertGreater(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 12, 22, 8, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 13, 10, 54, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is not up; rise on current day, set on next day"):
            dt = datetime(2023, 1, 12, 20, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 12, 22, 8, tzinfo=timezone.utc), rise_mg.dt)

        with self.subTest("moon is not up; rise and set on next day"):
            dt = datetime(2023, 1, 18, 20, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 19, 6, 8, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 19, 13, 7, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is not up; rise on next day, set on day after that"):
            dt = datetime(2023, 1, 26, 23, 30, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            a = annotate.Annotate(1872, 1404, mg, timezone.utc)
            (rise_mg, set_mg) = a._rise_set()
            self.assertEqual(datetime(2023, 1, 27, 10, 24, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 28, 0, 21, tzinfo=timezone.utc), set_mg.dt)

    def test_rise_set_overlap(self):
        # Here's a case that displays in a confusing way.  At 9:12am EDT on 2023-06-07, the moon had set around 30
        # minutes earlier, and is at 240deg azimuth.  The following rise and set are the next day at 12:17am and 10:01am
        # EDT, at 120deg and 243deg azimuth.  So the indicator is confusingly drawn between the rise and set times, as if
        # the moon were still up.  The rise and set annotations don't include the date, so there's no sign that they are
        # future times in this case; it only appears as if the moon will be setting soon, but the altitude indicator
        # is missing.
        dt = datetime(2023, 6, 7, 13, 12, tzinfo=timezone(timedelta(hours=-4)))
        pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
        mg = geometry.MoonGeometry(dt, 40.8, -73.95, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
        self.assertLess(mg.altitude, 0)
        self.assertAlmostEqual(mg.azimuth, 239.86, places=2)
        a = annotate.Annotate(1872, 1404, mg, timezone.utc)
        (rise_mg, set_mg) = a._rise_set()
        self.assertEqual(datetime(2023, 6, 8, 4, 17, tzinfo=timezone.utc), rise_mg.dt)
        self.assertEqual(datetime(2023, 6, 8, 14, 1, tzinfo=timezone.utc), set_mg.dt)

        self.assertAlmostEqual(rise_mg.azimuth, 119.91, places=2)

        self.assertAlmostEqual(set_mg.azimuth, 242.60, places=2)

    def test_can_draw_text(self):
        dt = datetime(2023, 6, 26, 20, 38, tzinfo=timezone(timedelta(hours=-4)))
        pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
        mg = geometry.MoonGeometry(dt, 40.8, -73.95, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
        self.assertAlmostEqual(mg.azimuth, 128.37, places=2)
        a = annotate.Annotate(1872, 1404, mg, timezone.utc)
        (rise_mg, set_mg) = a._rise_set()
        self.assertEqual(datetime(2023, 6, 26, 17, 22, tzinfo=timezone.utc), rise_mg.dt)
        self.assertEqual(datetime(2023, 6, 27, 5, 17, tzinfo=timezone.utc), set_mg.dt)
        self.assertAlmostEqual(rise_mg.azimuth, 92.61, places=2)
        self.assertAlmostEqual(set_mg.azimuth, 263.50, places=2)
        self.assertTrue(a._can_draw_text_at_azimuth(0))
        # Rise indicator is around 90, so can't draw there.
        self.assertFalse(a._can_draw_text_at_azimuth(90))
        self.assertTrue(a._can_draw_text_at_azimuth(180))
        self.assertTrue(a._can_draw_text_at_azimuth(270))
        # Can't draw at the azimuth, because it checks against that value
        self.assertFalse(a._can_draw_text_at_azimuth(mg.azimuth))
        # But can if we only check against rise and set
        self.assertTrue(a._can_draw_text_at_azimuth(mg.azimuth, *a._rise_set()))

    def test_lerp(self):
        dt = datetime(2023, 5, 1, tzinfo=timezone.utc)
        pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
        mg = geometry.MoonGeometry(dt, 40, -70, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
        a = annotate.Annotate(1872, 1404, mg, timezone.utc)
        self.assertEqual(632, a.azimuth_r1)
        self.assertEqual(702, a.azimuth_r2)
        self.assertEqual(642, a._lerp_altitude(0))
        self.assertEqual(692, a._lerp_altitude(90))
        self.assertEqual(667, a._lerp_altitude(45))

if __name__ == '__main__':
    unittest.main()
