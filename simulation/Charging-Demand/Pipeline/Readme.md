## Charging Demand Simulations Procesing Pipeline

The starting point for this pipeline is a set of `CSVs` that were
created by the trip based CDS.  Each `CSV` corresponds to a particular
scenario and has a filename that encodes the scenario parameters.  For
example, `demand_HOU_2014_B8C_5_rep30_ra32.93_frac10_ac-high.csv`,
corresponds to the CDS result of running CDS 30 replicates using the
`HOU_2014_B8C_5` trips, mean range acceptance of 32.93 miles (from the
London survey), EV market penetration of 10 percent, and high AC.
These `CSVs` should be saved into a scenario data directory that
contains no other `CSV` files.

### Pre-requisites

The pipeline is written in Python 3.  Install python3 and then the
requirements using pip:
```bash
$ pip3 install -r requirements.txt
```

### Configuration

The pipeline is controlled by the config file in yaml format.  An
example `config.yaml` is included in this repository.  The
config has the following attributes:

1. `blockgroups`: path to the Census Block Groups geometries with GEOIDs.
2. `nodes`: path to the Houston DynusT nodes with "nodeID" and
   "geometry" points in GeoJSON or shapefile (or any format that `fiona`
   can parse).
3. `datadirectory`: directory that contains the CDS results
4. `locationcode`: string that identifies the location, it should be
   part of the CDS output filenames (HOU, for example).  This the how
   the `combineCDSresults.py` script filters the `CSVs` to ingest.
5. `scenarioid`: the database ID of the scenario (from the scenario
   table)
6. `demand`: the filename for the `csv` (can be compressed) that
   combines all of the CDS node based demand results
7. `demandcolumns`: a list of column names that contain different
   kinds of demand
8. `attribcolumns`: a list of columns that identify each demand data
   point
9. `numcpu`: the number of CPUs to use
10. `blockgroupdemand`: the filename for the demand mapped to block
    groups
11. `demandtypes`: the `charging_strategy_id` that identifies each
    demand column; all values in `demandcolumns` must be covered, and
    the `charging_strategy_id` values must be present in the
    `charging_strategy` database table

### Execution

The pipeline consists of three scripts:

1. `combineCDSresults.py` reads the individual CDS results from the
   `datadirectory`, scales the demand by 3600 so that it is in kWh and
   outputs the combined dataset to the `datadirectory` to a file
   whose name is specified by the `demand` attribute.  It also outputs
   a `CSV` called `totalDemand.csv` which sums the demand over nodes
   and hours.  The `combineCDSresults.py` also checks that total
   demand summed over the individual results is the same as the total
   demand in the combined dataset.
2. `mapDemandToBlockGroups.py` reads the combined node based demand,
   the block group geometries, maps the demand into block groups using
   the Voronoi tesselation of the nodes, computes the demand density,
   and outputs the block group based demand dataset to a file whose
   name is specified by the `blockgroupdemand` attribute of the config.
3. `prepForDBload.py` reads the block group based demand dataset and
   prepares a `CSV` ready for loading into the database.  This `CSV`
   is saved as `blockgroup_demand_density.csv` in the `datadirectory`
   specified in the `config`.
   
All three scripts require a single command line parameter: the path to
the `yaml` config.

### Database loading

The `blockgroup_demand_density.csv` is a header-less file suitable for
use with the `run_insert.py` script in the Database repository.
