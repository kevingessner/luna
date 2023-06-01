# Luna

e-paper moon clock

Designed for Raspberry Pi with a Waveshare e-paper display.

Tested with Raspberry Pi Zero WH & Waveshare 10.3", 16-grays, 1872x1404px display: https://www.waveshare.com/10.3inch-e-paper.htm

Software in two parts:
1. C code to interact with the screen
	- just display a BMP
2. python code
	- figure out moon phase from NASA's dial-a-moon API
	- generate image
	- calls the C code

## Build and install

Depends on autoconf and imagemagick: `sudo apt-get install autoconf imagemagick`

To compile luna: `make`

To install the luna systemd service and start the process: `VCOM=YOUR_VCOM make install`
> `YOUR_VCOM` is the vcom value from your screen's cable, a small negative number like `-1.37`.
> See [the docs](https://www.waveshare.com/wiki/10.3inch_e-Paper_HAT#Use_the_correct_VCOM_value)
