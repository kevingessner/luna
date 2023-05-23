# Luna
 
e-paper moon clock

Software in two parts:
1. C code to interact with the screen
	- just display a BMP
2. python code
	- figure out moon phase
	- generate image
	- calls the C code
	
## Build and install

```
cd bcm2835-1.71
./configure --prefix=$(pwd)/bin
make
make install
cd ..

cd waveshare
CFLAGS="-L $(pwd)/../bcm2835-1.71/bin/lib -I $(pwd)/../bcm2835-1.71/bin/include" make
```
