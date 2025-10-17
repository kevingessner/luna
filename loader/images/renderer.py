import logging
import os
import shlex
import subprocess
import typing
from datetime import datetime

from . import ephemeris


log = logging.getLogger(__name__)


def moon_image_for_datetime(dt: datetime, path: str) -> typing.Tuple[str, float]:
    target = ephemeris.moon_eph_for_datetime(dt)
    log.info(f'ephemeris data:')
    log.info(f'  phase: {target.phase}')
    log.info(f'  subearth: {target.subearth}')
    log.info(f'  subsolar: {target.subsolar}')
    log.info(f'  posangle: {target.posangle}')
    args = ('node',
        os.path.join(os.path.dirname(__file__), "renderer", "bin", "index.mjs"),
        '--subEarthLatitude=' + str(target.subearth[0]),
        '--subEarthLongitude=' + str(target.subearth[1]),
        '--subSunLatitude=' + str(target.subsolar[0]),
        '--subSunLongitude=' + str(target.subsolar[1]),
        '--imagePath', path,
    )
    log.info(f'rendering:\n{shlex.join(args)}')
    try:
        proc = subprocess.run(args, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        log.error('process failed:\n'+ e.stdout.decode() + '\n' + e.stderr.decode(), exc_info=e)
        raise
    log.info(f'rendering complete:\n{proc.stdout}\n{proc.stderr}')
    return (path, target.posangle)
