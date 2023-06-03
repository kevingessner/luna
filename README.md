# Luna

e-paper moon clock

Designed for Raspberry Pi with a Waveshare e-paper display.

Tested with Raspberry Pi Zero WH & Waveshare 10.3", 16-grays, 1872x1404px display: https://www.waveshare.com/10.3inch-e-paper.htm

## Build and install

Depends on autoconf and imagemagick: `sudo apt-get install autoconf imagemagick`

To compile luna: `make`
> Compilation is entirely local to the current directory

To install the luna systemd service and start the process every minute: `VCOM=YOUR_VCOM make install`

`YOUR_VCOM` is the vcom value from your screen's cable, a small negative number like `-1.37`.
See [the waveshare docs](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT#Use_the_correct_VCOM_value)

> Systemd creates a symlink to `systemd/luna.service` in the current directory,
> so relocate this code to its permanent home before `make install`.

## Development

The various components can be developed independently:

- `bcm2835-1.71/`: Broadcom BCM 2835 library from http://www.airspayce.com/mikem/bcm2835/
    - required by the waveshare code
    - build with `make bcm2835`
- `waveshare/`: C code based on Waveshare's RPi library at https://github.com/waveshare/IT8951-ePaper/tree/master/Raspberry
    - builds `bin/epd`, which displays a bitmap on the e-paper display
    - build with `make waveshare` after building `bcm2835` at least once
- `loader/`: Python code that downloads the moon image, prepares it for display, and optionally displays it
    - caches data to `/var/tmp/luna`
    - hard-coded display size and location are here
    - requires a virtualenv that is built by `make loader`
- `systemd/`: systemd unit for running the loader
    - installs a service named `luna`
    - see its logs with `sudo journalctl -eu luna`
    - `make uninstall` to stop and remove the service
