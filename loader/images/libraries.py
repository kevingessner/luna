import json
import os
import typing
from dataclasses import dataclass
from functools import cached_property

# Store the images downloaded from NASA underneath the folder containing this file.
DATA_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'nasa')


@dataclass
class MoonImageInfo:
    time: str
    phase: float # percentage from 0-100
    age: float # from 0-28
    subearth: typing.Tuple[float, float] # lat, lon
    posangle: float
    index: typing.Optional[str] = None
    library: typing.Optional['Library'] = None

    @classmethod
    def from_json(cls, d):
        if 'time' in d:
            return MoonImageInfo(**{k: d[k] for k in ('time', 'phase', 'age', 'subearth', 'posangle')})
        if 'lon' in d:
            return (d['lat'], d['lon'])
        return d


@dataclass
class Library:
    name: str
    json_url: str

    @property
    def library_dir(self, root: str = DATA_DIR) -> str:
        return os.path.join(root, self.name)

    @property
    def json_path(self) -> str:
        return os.path.join(self.library_dir, 'mooninfo.json')

    @property
    def images_url(self) -> str:
        return os.path.join(os.path.dirname(self.json_url), 'frames', '3840x2160_16x9_30p', 'plain')

    def image_file_name(self, target: MoonImageInfo, extension: str = 'png') -> str:
        if target.index is None:
            raise Exception(f'library {self.name}: uninitialized target {target}')
        return f'moon.{target.index}.{extension}'

    def image_path(self, target: MoonImageInfo, extension: str = 'png') -> str:
        return os.path.join(self.library_dir, self.image_file_name(target, extension))

    def image_url(self, target: MoonImageInfo) -> str:
        return os.path.join(self.images_url, self.image_file_name(target, 'tif'))

    @cached_property
    def available_targets(self):
        with open(self.json_path, 'r') as f:
            targets = json.load(f, object_hook=MoonImageInfo.from_json)
        for i, target in enumerate(targets):
            # NASA images are 1-indexed and padded to 4 digits.
            i += 1
            target.index = f'{i:04d}'
            target.library = self
        return targets


LIBRARIES = (
    Library('2021', 'https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004874/mooninfo_2021.json'),
    Library('2022', 'https://svs.gsfc.nasa.gov/vis/a000000/a004900/a004955/mooninfo_2022.json'),
)
