# Luna

e-paper moon clock

Shows the phase, current sky position, and rise & set times of the Moon.

![Luna, framed and hung](luna-2023-08-25.jpg)

Powered by a Raspberry Pi with a Waveshare e-paper display.

## Build and install

The Raspberry Pi is flashed with Raspberry Pi OS,
and configured with SSH access and Wifi at imaging time.

You can copy the entire `luna` repository to your raspi.

First install a few packages:
```
sudo apt-get install autoconf autoconf-archive libtool imagemagick python3-venv fontconfig fonts-liberation fonts-urw-base35 gpiod chromium xvfb iptables
```

Then enable `SPI` with no chip select.
Edit `/boot/firmware/config.txt`.
Ensure the line `dtparam=spi=on` is not commented, and add the line `dtoverlay=spi0-0cs` immediately after it.
Reboot.

To compile luna: `make`

> Compilation is entirely local to the current directory

Set your latitude and longitude (positive is north/east):

```
echo XX.XX > config/latitude
echo YY.YY > config/longitude
```

To install the luna systemd services and timer: `VCOM=YOUR_VCOM make install`

`YOUR_VCOM` is the vcom value from your screen's cable, a small negative number like `-1.37`.
See [the waveshare docs](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT#Use_the_correct_VCOM_value)

> Systemd creates symlinks to files in `systemd/` in the current directory,
> so relocate this code to its permanent home before `make install`.

Luna uses `/var/tmp/luna` as scratch space.
This can be safely cleared at any time the process is not actively running.


## Development

I designed and tested Luna with Raspberry Pi 5, Debian Trixie, & [Waveshare 10.3", 16-grays, 1872x1404px display](https://www.waveshare.com/10.3inch-e-paper.htm).
The Raspberry Pi 4 may also work but older models likely won't -- the rendering code requires a GPU and at least 1GB of RAM.
Other display models should work, with slight modifications (see below), but are not tested -- YMMV.

The various components can be developed independently:

- `libgpiod-1.6.x/`: libgpiod from https://github.com/brgl/libgpiod/tree/v1.6.x
    - required by the waveshare code -- v2.x from `apt` is too new and incompatible
    - ran `autoupdate` before checking in
    - build with `make libgpiod`
- `waveshare/`: C code based on Waveshare's RPi library at https://github.com/waveshare/IT8951-ePaper/tree/master/Raspberry
    - builds `bin/epd`, which displays a bitmap on the e-paper display
    - build with `make waveshare` after building `libgpiod` at least once
- `loader/`: Python code that prepares the moon image for display and optionally displays it
    - produces `/var/tmp/luna/tmp-display.bmp` for display
    - hard-coded display size and location are here
    - requires a virtualenv that is built by `make loader`
- `systemd/`: systemd unit for running the loader
    - installs a service named `luna`, a timer `luna.timer` that triggers it, and `luna-config` service that allows setting up Luna over HTTP
    - see its logs with `sudo journalctl -eu luna`
    - `make uninstall` to stop and remove the services

To produce the image `/var/tmp/luna/tmp-display.bmp` that will be displayed,
run `./loader/main.py` (after running `make` at least once).
You do not need to re-`make` after changes to `loader`'s Python files;
just re-run `main.py`.

The image produced by `main.py` includes some debugging info that is covered by the frame:

![Luna example image](luna-display-example.png)

## Frame and mount

I mounted Luna for display in a 10"x10" frame ([Blick 18862-2010](https://www.dickblick.com/items/blick-wood-gallery-frame-black-10-x-10-/)),
matted with black museum board ([Blick 13447-2051](https://www.dickblick.com/items/super-black-presentation-and-mounting-board-15-x-20-14-ply-black/)).
The mat is 9-3/4" square, with a 6-1/8" diameter circle laser-cut in its center.
The display is taped to the back of the mat,
with the ribbon cable through a slot cut in the frame's backing.
The Raspberry Pi and e-ink driver board are mounted on a [3d-printed bracket](frame/luna-board-mount.stl) affixed to the backing,
with standard standoffs and screws.

![frame mount](frame/mount.jpg)

## Limitations and TODOs

- The e-ink display has two parameters that are hard-coded to the 10.3" display; change accordingly to your display:
    - `DISPLAY_DIMENSIONS_PX` in `loader/main.py`
    - Screen mode argument to `epd` in `systemd/luna.service.tmpl` (`ExecStart` line)
