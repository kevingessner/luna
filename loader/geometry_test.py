#!/usr/bin/env venv/bin/python

import math
import unittest
from datetime import datetime, timedelta, timezone, tzinfo

import astral.moon as astral_moon

import geometry

class GeometryTest(unittest.TestCase):

    def test_nearest_rise_and_set(self):
        '''Test a variety of cases of rises and sets; confirmed against https://www.timeanddate.com/moon/uk/london?month=1&year=2023,
        with some one-minute errors due to imprecision/refaction'''

        with self.subTest("moon is up; rise and set on current day"):
            dt = datetime(2023, 1, 20, 12, 0, 0, tzinfo=timezone.utc)
            mg = geometry.MoonGeometry.for_datetime(dt, 51.5, -0.13)
            self.assertGreater(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
            self.assertEqual(datetime(2023, 1, 20, 7, 22, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 20, 14, 11, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is not up; rise and set on current day"):
            dt = datetime(2023, 1, 20, 3, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
            self.assertEqual(datetime(2023, 1, 20, 7, 22, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 20, 14, 11, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is up; rise on previous day, set on current day"):
            dt = datetime(2023, 1, 14, 1, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertGreater(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
            self.assertEqual(datetime(2023, 1, 13, 23, 21, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 14, 11, 6, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is up; rise on current day, set on next day"):
            dt = datetime(2023, 1, 12, 23, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertGreater(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
            self.assertEqual(datetime(2023, 1, 12, 22, 8, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 13, 10, 54, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is not up; rise on current day, set on next day"):
            dt = datetime(2023, 1, 12, 20, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
            self.assertEqual(datetime(2023, 1, 12, 22, 8, tzinfo=timezone.utc), rise_mg.dt)

        with self.subTest("moon is not up; rise and set on next day"):
            dt = datetime(2023, 1, 18, 20, 0, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
            self.assertEqual(datetime(2023, 1, 19, 6, 8, tzinfo=timezone.utc), rise_mg.dt)
            self.assertEqual(datetime(2023, 1, 19, 13, 7, tzinfo=timezone.utc), set_mg.dt)

        with self.subTest("moon is not up; rise on next day, set on day after that"):
            dt = datetime(2023, 1, 26, 23, 30, 0, tzinfo=timezone.utc)
            pos = astral_moon.moon_position(geometry.days_since_j2000(dt))
            mg = geometry.MoonGeometry(dt, 51.5, -0.13, geometry.radians_to_hours(pos.right_ascension), math.degrees(pos.declination))
            self.assertLess(mg.altitude, 0)
            (rise_mg, set_mg) = mg.nearest_rise_and_set
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
        (rise_mg, set_mg) = mg.nearest_rise_and_set
        self.assertEqual(datetime(2023, 6, 8, 4, 17, tzinfo=timezone.utc), rise_mg.dt)
        self.assertEqual(datetime(2023, 6, 8, 14, 1, tzinfo=timezone.utc), set_mg.dt)

        self.assertAlmostEqual(rise_mg.azimuth, 119.91, places=2)

        self.assertAlmostEqual(set_mg.azimuth, 242.60, places=2)


if __name__ == '__main__':
    unittest.main()
