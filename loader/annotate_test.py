#!/usr/bin/env venv/bin/python

import math
import unittest
from datetime import datetime, timedelta, timezone, tzinfo

import annotate
import geometry

class AnnotateTest(unittest.TestCase):
    def test_astral_year(self):
        '''Ensure the moon rise/set logic works on a large number of days without errors.'''
        start_dt = datetime(2023, 6, 1, tzinfo=timezone.utc)
        for days in range(365):
            dt = start_dt + timedelta(days=days)
            with self.subTest(dt=dt, days=days):
                mg = geometry.MoonGeometry.for_datetime(dt, 40, -70)
                a = annotate.Annotate(1872, 1404, mg, timezone.utc)
                a._draw_moon_path()

    def test_can_draw_text(self):
        dt = datetime(2023, 6, 26, 20, 38, tzinfo=timezone(timedelta(hours=-4)))
        mg = geometry.MoonGeometry.for_datetime(dt, 40.8, -73.95)
        self.assertAlmostEqual(mg.azimuth, 128.37, places=2)
        a = annotate.Annotate(1872, 1404, mg, timezone.utc)
        (rise_mg, set_mg) = mg.nearest_rise_and_set
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
        self.assertTrue(a._can_draw_text_at_azimuth(mg.azimuth, rise_mg, set_mg))

    def test_lerp(self):
        dt = datetime(2023, 5, 1, tzinfo=timezone.utc)
        mg = geometry.MoonGeometry.for_datetime(dt, 40, -70)
        a = annotate.Annotate(1872, 1404, mg, timezone.utc)
        self.assertEqual(632, a.azimuth_r1)
        self.assertEqual(702, a.azimuth_r2)
        self.assertEqual(642, a._lerp_altitude(0))
        self.assertEqual(692, a._lerp_altitude(90))
        self.assertEqual(667, a._lerp_altitude(45))

if __name__ == '__main__':
    unittest.main()
