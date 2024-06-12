#!/usr/bin/env python3

'''this script converts the demand results with density for loading
into the SQL database'''

import sys
if len(sys.argv) != 2:
    print('Usage:',sys.argv[0],'path_to_config_yaml')
    sys.exit()
    
import yaml
config = yaml.load(open(sys.argv[1]),Loader = yaml.Loader)

import pandas as pd
import numpy as np
import os
demand = pd.read_csv(
    os.path.join(config['datadirectory'],
                 config['blockgroupdemand'])
)
if 'meanRangeAnxiety' not in demand.columns:
    demand['meanRangeAnxiety'] = 32.93 # default

# rename columns
demand = demand.rename(
    columns = {
        'GEOID':'block_group_id',
        'hourID':'hour_id',
        'marketFraction':'marketshare_pct',
        'AC':'ac',
        'meanRangeAnxiety':'mean_range_anxiety',
    }
)

# separate demand types
demandDataByType = []
for demandColumn in config['demandcolumns']:
    demandType = config['demandtypes'][demandColumn]
    demandDensityColumn = f'{demandColumn}DensityLog10'
    data = demand.rename(
        columns = {
            demandColumn:'demand_kwh',
            demandDensityColumn:'demand_log10_kwh'
        }
    )
    data['charging_strategy_id'] = demandType
    data['scenario_id'] = config['scenarioid']
    # replace -Inf with -1000
    data.loc[data.demand_log10_kwh == -np.inf,'demand_log10_kwh'] = -1000
    demandDataByType.append(
        data[
            ['block_group_id','scenario_id','charging_strategy_id',
             'hour_id','ac','marketshare_pct','mean_range_anxiety',
             'demand_log10_kwh','demand_kwh']
        ]
    )

# concatenate and output without the header for SQL loading
pd.concat(demandDataByType).to_csv(
    os.path.join(
        config['datadirectory'],'blockgroup_demand_density.csv'
    ),index = False,header = False
)
