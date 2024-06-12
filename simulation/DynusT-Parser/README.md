# DynusT-Parser

The code in this repository contains the script to convert the the
DynusT network definition shapefile into a `links.csv` and then
combine DynusT outputs `output_vehicle.dat` and `vehTrajectory.dat` to
make `trips.csv` that is used by the LDV charging demand simulator.

### Making `links.csv`

The `makeLinks.py` script reads the DynusT network definition and
outputs `links.csv` with "linkID" and "length" (in miles).  linkID is
a dash separated origin and destination nodeIDs of the link.  For example:
```bash
$ sudo -H pip3 install -r requirements.txt
$ ./makeLinks.py /data/DynusT/Networks/HOU2014_8county_base.geojson.gz
```

### Attributes

The `trips.csv` is made by compiling and running `makeTrips.exe`.  For
example:
```bash
$ sudo apt install g++ make libboost-system-dev libboost-iostreams-dev libboost-filesystem-dev
$ make
$ ./makeTrips.exe links.csv VehTrajectory.dat output_vehicle.dat trips.csv
```

This is a long operation. On an i7-1065G7, it took 30 minutes to complete.

The resulting `trips.csv` has the following columns:
1. `vehID`: unique trip ID
2. `vehType`: DynusT vehicle type.  The list of vehicle types that
   represent to light duty vehilcle trips is hard coded in the
   `system.cpp` file of the `Charging-Demand` repository
3. `departMinute`: trip departure time in minutes from midnight
4. `originAnode`: the nodeID of the upstream node of the trip origin
   link
5. `originBnode`: the nodeID of the downstream node of the trip origin
   link
6. `originLinkFrac`: fraction of the origin link that is traversed by
   the vehicle (from the loading point on the origin link to the
   downstream node of the origin link)
7. `originZone`: the ID of the traffic analysis zone of the origin
   link
8. `arriveMinute`: arrival time of the trip in minutes from midnight
9. `destNode`: node ID for the terminus of the trip
10. `destZone`: zone ID of the destination node
11. `vmt`: total length of the trip in miles

### Notes:

The DynusT parser skips incomplete trips (those that did not reach
their destination when the DTA simulation was terminated).  Usually
incomplete trips comprise ~ 0.1 -- 0.2% of all trips.  The incomplete
trips must be discarded because there is no information about the
intermediate point where the vehicle was when the simulation stopped.
The legacy, Python based DynusT parser found in the TTI's
TEMPO-pipeline repository, as well as the C++ based DynusT parser
found in the TEMPO-cpp-pipeline, did not discard the incomplete trips
because we needed only link-by-link volumes diced by speed, time, and
vehicle type.
