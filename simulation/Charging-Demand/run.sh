#!/bin/bash

if [ $# -ne 4 ]; then
    echo Usage: $0 dynusTrep numReps AC percentEVs
    exit 1
fi

n=$1
r=$2
ac=$3
frac=$4
ra=32.93

nohup ./simulate $r $ra ../NHTSprocessing/tripParams_TX.csv \
      /data/Charging-demand/BevData/bevDescr_${frac}.csv \
      /data/Charging-demand/HOU_2014_B8C_${n}/trips.csv \
      /data/Charging-demand/HOU_2014_B8C_${n}/ac-${ac}/tripEnergies.csv \
      demand_HOU_2014_B8C_${n}_rep${r}_ra${ra}_frac${frac}_ac-${ac}.csv > \
      output_${n}_${frac}_${ac} &
