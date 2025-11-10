#!/bin/bash
CON=rpi_ap
IP=192.168.2.1

nmcli connection add type wifi ifname wlan0 con-name "$CON" autoconnect yes \
	ssid "$HOSTNAME" \
	802-11-wireless.mode ap \
	802-11-wireless.band bg \
	ipv4.method manual \
	ipv4.address $IP/24 \
	wifi-sec.key-mgmt wpa-psk \
	wifi-sec.pairwise ccmp \
	wifi-sec.proto rsn \
	wifi-sec.psk "$HOSTNAME"

nmcli connection up "$CON"




# serve at 8000
#hotspot-detect.html

# Resolve all DNS lookups to this host, without forwarding them upstream.  This ensures
# that any URL used for hotspot detection will end up here.
cat > /etc/NetworkManager/dnsmasq-shared.d/redirect.conf <<EOF
local=/#/
address=/#/$IP
EOF

systemctl restart NetworkManager
