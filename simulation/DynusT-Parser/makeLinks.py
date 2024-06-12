#!/usr/bin/env python3

import sys
if len(sys.argv) != 3:
    print('Usage:',sys.argv[0],'pathToDynaStudioShapeFile', '<output_file_path>')
    sys.exit(1)

epsg = 3082 # this projected EPSG is in meters
import geopandas as gpd
from smart_open import open
shp = gpd.read_file(
    open(sys.argv[1],'rb')
).to_crs(epsg = epsg)

# add the linkID column
shp['linkID'] = [f'{r.A_NODE}-{r.B_NODE}' for r in shp.itertuples()]

milesInMeter = 0.000621371
shp['length'] = shp.geometry.length*milesInMeter

# output
shp[['linkID','length']].to_csv(sys.argv[2],index = False)

