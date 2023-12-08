DIR_BIN      = ./bin

OBJ_C = $(wildcard *.c)
OBJ_O = $(patsubst %.c,${DIR_BIN}/%.o,$(notdir ${OBJ_C}))

TARGET = $(DIR_BIN)/epd

CC = gcc

MSG = -g -O3 -Wall
DEBUG = -D USE_DEBUG
STD = -std=gnu99

CFLAGS += $(MSG) $(DEBUG) $(STD)

LIB = -lbcm2835 -lm -lrt -lpthread

$(shell mkdir -p $(DIR_BIN))

${TARGET}:${OBJ_O}
	$(CC) $(CFLAGS) $(OBJ_O) -o $@ $(LIB) 

${DIR_BIN}/%.o:%.c
	$(CC) $(CFLAGS) -c  $< -o $@ 

clean :
	rm -f $(DIR_BIN)/*.*

