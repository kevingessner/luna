WAVESHARE=waveshare
LIBGPIOD=$(PWD)/libgpiod-1.6.x
LIBGPIOD_BIN=$(LIBGPIOD)/bin
SYSTEMD=systemd/luna.service
CONFIG_SYSTEMD=systemd/luna-config.service
PYTHON_VENV=$(PWD)/loader/venv

.PHONY: all
all: libgpiod waveshare loader

.PHONY: waveshare
waveshare:
	CFLAGS="-L $(LIBGPIOD_BIN)/lib -I $(LIBGPIOD_BIN)/include -Wl,-rpath,$(LIBGPIOD_BIN)/lib" $(MAKE) -C waveshare

.PHONY: libgpiod
libgpiod:
	cd $(LIBGPIOD) && ./autogen.sh --enable-tools=yes --prefix=$(LIBGPIOD_BIN)
	$(MAKE) -C $(LIBGPIOD)
	$(MAKE) -C $(LIBGPIOD) install

.PHONY: loader
loader: $(PYTHON_VENV)
	$(PYTHON_VENV)/bin/pip install loader/astral-3.2-py3-none-any.whl

.PHONY: loader_dev
# mypy has online dependencies, so only install it when needed (not in production)
loader_dev: loader
	$(PYTHON_VENV)/bin/pip install loader/mypy-1.4.1-py3-none-any.whl

$(PYTHON_VENV):
	python3 -m venv $@

.PHONY: clean
clean: uninstall
	rm -f $(SYSTEMD) $(CONFIG_SYSTEMD)
	rm -rf $(PYTHON_VENV) $(PWD)/loader/__pycache__
	$(MAKE) -C $(LIBGPIOD) clean || true
	$(MAKE) -C $(WAVESHARE) clean || true

$(SYSTEMD): systemd/luna.service.tmpl FORCE
ifndef VCOM
	$(error VCOM=YOUR_VCOM (value from e-paper cable) is required)
endif
	env VCOM=$(VCOM) DIR=$(PWD) envsubst <$< >$@

$(CONFIG_SYSTEMD): systemd/luna-config.service.tmpl FORCE
	env DIR=$(PWD) envsubst <$< >$@

.PHONY: install
install: $(SYSTEMD) $(CONFIG_SYSTEMD)
	for f in $^; do sudo systemctl enable $(PWD)/$$f; done
	sudo systemctl start luna
	sudo systemctl start luna-config

.PHONY: uninstall
uninstall:
	sudo systemctl stop luna || true
	sudo systemctl disable luna || true
	sudo systemctl stop luna-config || true
	sudo systemctl disable luna-config || true

test: loader/**/*.py | loader_dev
	$(PYTHON_VENV)/bin/python -m unittest -v $^
	$(PYTHON_VENV)/bin/mypy --python-version 3.9 $^

FORCE:
