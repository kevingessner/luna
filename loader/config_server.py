#!/usr/bin/env bash
"exec" "`dirname $0`/venv/bin/python" "$0" "$@"
# ^ line following shebang is magic, and results in this script running with the venv's python no matter how it is
# invoked (e.g. `./main.py`, `./loader/main.py`, `venv/bin/python main.py`).  It's a noop in python (just strings!)
# but a command in bash to replace the interpreter with the venv python.

import http.server
import logging

from luna.config.http import Handler

log = logging.getLogger()
PORT = 8000

if __name__ == '__main__':
    logging.basicConfig(format='%(levelname)s: %(message)s', level=logging.INFO)

    with http.server.ThreadingHTTPServer(('', PORT), Handler) as httpd:
        log.info('serving')
        httpd.serve_forever()
