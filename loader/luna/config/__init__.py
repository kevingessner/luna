import os.path


CONFIG_DIR = os.path.realpath(os.path.join(os.path.dirname(os.path.realpath(__file__)), '..', '..', '..', 'config'))

class LunaNeedsConfigException(Exception):

    message = f'\n\n*** luna needs to be configured; see {CONFIG_DIR}/README.md ***\n\n'

    def __init__(self):
        super().__init__(self.message)

    def __str__(self):
        return self.message


def _read(name: str) -> float:
    with open(os.path.join(CONFIG_DIR, name), 'r') as f:
        return float(f.read())

def get_location():
    try:
        return (_read('latitude'), _read('longitude'))
    except Exception as e:
        raise LunaNeedsConfigException from e
