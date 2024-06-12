#!/usr/bin/env python3
import argparse
import os
import mapper
import pandas as pd
from joblib import Parallel,delayed
from smart_open import open

def main(block_groups_file, nodes_file, counties_file, simulated_demand_file, output_file, threads=16):
    m = mapper.Mapper()
    m.load_counties(counties_file)
    m.load_block_groups(block_groups_file)
    m.load_point_locations(nodes_file)
    m.generate_region()
    m.discord_points_outside_region()
    m.make_voronoi_cells()
    m.overlay_cells_block_groups()

    demand = pd.read_csv(
        os.path.join(simulated_demand_file)
    )
    demand_columns = ['homeDemand', 'publicDemand', 'officeDemand']
    group_columns = ['AC', 'marketFraction', 'hourID']
    groups = list(demand.groupby(group_columns))
    keys = [g[0] for g in groups]
    data_groups = [g[1] for g in groups]
    results = Parallel(n_jobs = threads)(
        delayed(m.calc_block_averages)(group,demand_columns)
        for group in data_groups
    )

    # set the missing columns for the results
    results_with_attributes = []
    for group_key,result in zip(keys,results):
        for idx,attribute in enumerate(group_columns):
            result[attribute] = group_key[idx]
        results_with_attributes.append(result)

    # combine the block group mapped demand results from different chunks 
    # of data
    demand = pd.concat(results_with_attributes)

    # scale and compute demand density
    demand = m.calc_data_density(demand,demand_columns)

    # save
    path = os.path.join(output_file)
    print('Saving block group demand to',path)
    demand.to_csv(open(path,'w'),index = False)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('block_groups_file', help='a .zip file containing the block group geometries')
    parser.add_argument('counties_file', help='a .zip file containing county geometries')
    parser.add_argument('nodes_file', help='a GeoJSON file containing the traffic model node information')
    parser.add_argument('simulated_demand_file', help='the output of the charging demand simulation')
    parser.add_argument('output_file', help='the file which this program will write to')
    parser.add_argument('--threads', type=int, help='the number of threads to run this program')
    args = parser.parse_args()

    main(args.block_groups_file, args.nodes_file, args.counties_file, args.simulated_demand_file, args.output_file, args.threads)