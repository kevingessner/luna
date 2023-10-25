#!/usr/bin/env bash

# Download ephemeris data from JPL Horizons for a range of years, as needed by ephemeris.py.

dir=$(dirname "$(realpath "$0")")

for year in $(seq 2023 2073)
do
    curl "https://ssd.jpl.nasa.gov/api/horizons.api?format=text&MAKE_EPHEM=YES&COMMAND=301&EPHEM_TYPE=OBSERVER&CENTER=%27500@399%27&START_TIME=%27$year-01-01%27&STOP_TIME=%27$((year+1))-01-01%27&STEP_SIZE=%271%20HOURS%27&QUANTITIES=%271,10,14,15,17,24%27&REF_SYSTEM=%27ICRF%27&CAL_FORMAT=%27CAL%27&CAL_TYPE=%27M%27&TIME_DIGITS=%27MINUTES%27&ANG_FORMAT=%27HMS%27&APPARENT=%27AIRLESS%27&RANGE_UNITS=%27AU%27&SUPPRESS_RANGE_RATE=%27NO%27&SKIP_DAYLT=%27NO%27&SOLAR_ELONG=%270,180%27&EXTRA_PREC=%27NO%27&R_T_S_ONLY=%27NO%27&CSV_FORMAT=%27YES%27&OBJ_DATA=%27NO%27"> $dir/ephemeris/$year.txt
done
