import unittest
from datetime import datetime, timedelta, timezone

from . import finder


class FinderTest(unittest.TestCase):

    @unittest.skip("long test only needed with new ephemeris files")
    def test_future(self):
        '''Test every hour of every year in the downloaded ephemerises, 2023-2073.'''
        base_dt = datetime(2023, 10, 30, 0, 0, 0, tzinfo=timezone.utc)
        for hours in range(365 * 24 * 50):
            dt = base_dt + timedelta(hours=hours)
            with self.subTest(dt):
                if dt.day == 1 and dt.hour == 0:
                    print(dt)
                finder.moon_image_for_datetime(dt)

    def test_images(self):
        '''Different images on either side of a half hour'''
        dt = datetime(2023, 10, 30, 12, 5, 0, tzinfo=timezone.utc)
        img = finder.moon_image_for_datetime(dt)
        path = img[0].split('/')[-2:]
        self.assertEqual(path, ['2021', 'moon.2825.png'])
        self.assertEqual(img[1], 348.149)

        # same as above
        dt = datetime(2023, 10, 30, 12, 25, 0, tzinfo=timezone.utc)
        img = finder.moon_image_for_datetime(dt)
        path = img[0].split('/')[-2:]
        self.assertEqual(path, ['2021', 'moon.2825.png'])
        self.assertEqual(img[1], 348.149)

        # different -- rounds to 13:00
        dt = datetime(2023, 10, 30, 12, 35, 0, tzinfo=timezone.utc)
        img = finder.moon_image_for_datetime(dt)
        path = img[0].split('/')[-2:]
        self.assertEqual(path, ['2022', 'moon.7524.png'])
        self.assertEqual(img[1], 348.3392)
