WAVESHARE=waveshare
BCM2835=bcm2835-1.71
BCM2835_BIN=$(PWD)/$(BCM2835)/bin
SYSTEMD=systemd/luna.service
PYTHON_VENV=$(PWD)/loader/venv

.PHONY: all
all: bcm2835 waveshare loader

.PHONY: waveshare
waveshare:
	CFLAGS="-L $(BCM2835_BIN)/lib -I $(BCM2835_BIN)/include" $(MAKE) -C waveshare

.PHONY: bcm2835
bcm2835:
	cd $(BCM2835) && ./configure --prefix=$(BCM2835_BIN)
	$(MAKE) -C $(BCM2835)
	$(MAKE) -C $(BCM2835) install

loader: $(PYTHON_VENV)
	$(PYTHON_VENV)/bin/pip install loader/astral-3.2-py3-none-any.whl

$(PYTHON_VENV):
	python3 -m venv $@

.PHONY: clean
clean: uninstall
	rm -f $(SYSTEMD)
	$(MAKE) -C $(BCM2835) clean
	$(MAKE) -C $(WAVESHARE) clean

$(SYSTEMD): systemd/luna.service.tmpl FORCE
ifndef VCOM
	$(error VCOM=YOUR_VCOM (value from e-paper cable) is required)
endif
	env VCOM=$(VCOM) DIR=$(PWD) envsubst <$< >$@

.PHONY: install
install: $(SYSTEMD)
	sudo systemctl enable $(PWD)/$<
	sudo systemctl start luna

.PHONY: uninstall
uninstall:
	sudo systemctl stop luna || true
	sudo systemctl disable luna || true

FORCE:
