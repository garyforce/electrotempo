#!/usr/bin/env python3

import sys
import os
import pandas as pd
from smart_open import open
import yaml

def extractParams(path):
    # extract run parameters from filename
    path = path.split('/')[-1]
    tokens = path.split('_')
    ac = tokens[-1].split('.')[0].split('-')[-1]
    replicate = int(tokens[1][3:])
    frac = int(tokens[3][4:])
    return replicate,frac,ac

class Combiner(object):
    def __init__(self,input_file_directory, output_file_directory):
        self.input_file_directory = input_file_directory
        self.output_file_directory = output_file_directory

    def identifyDatasets(self):
        self.datasets = [
            os.path.join(self.input_file_directory,fileName)
            for fileName in os.listdir(self.input_file_directory)
            if fileName.lower().endswith('csv')
        ]

    def readDatasets(self):
        self.identifyDatasets()
        datasets = []
        for csv in self.datasets:
            print('Reading',csv)
            dataset = pd.read_csv(csv)
            rep,frac,ac = extractParams(csv)
            dataset['replicate'] = rep
            dataset['marketFraction'] = frac
            dataset['AC'] = ac
            datasets.append(dataset)

        self.demand = pd.concat(datasets)

    def computeTotalDemand(self):
        self.totalDemand = self.demand.groupby(
            ['replicate','marketFraction','AC']
        ).agg(
            {'homeDemand':sum,'officeDemand':sum,'publicDemand':sum}
        ).reset_index().groupby(
            ['marketFraction','AC']
        )[['homeDemand','officeDemand','publicDemand']].mean()/3600. # in kWh

    def averageOverReplicates(self):
        # also convert kJ to kWh via dividing by 3600
        home = self.demand.groupby(
            ['nodeID','hourID','marketFraction','AC']
        ).homeDemand.mean()/3600.
        office = self.demand.groupby(
            ['nodeID','hourID','marketFraction','AC']
        ).officeDemand.mean()/3600.
        pub = self.demand.groupby(
            ['nodeID','hourID','marketFraction','AC']
        ).publicDemand.mean()/3600.
        self.demand = pd.concat([home,office,pub],axis = 1).reset_index()

    def checkTotals(self,relativeTolerance):
        checkPassed = True
        for k,data in self.demand.groupby(['marketFraction','AC']):
            for col in ['homeDemand','officeDemand','publicDemand']:
                tot = self.totalDemand.loc[k,col]
                avgtot = data[col].sum()
                diff = abs(tot - avgtot)/tot
                print(k,col,diff)
                if diff > relativeTolerance:
                    checkPassed = False
                    print('Total',col,'for market fraction',
                          k[0],'and AC',k[1],'does not match')

        if checkPassed:
            print('Total demand checks out at tolerance',relativeTolerance)
        else:
            print('Problem with matching total demand')
            
    def output(self):
        path = os.path.join(self.output_file_directory,'combinedDemand.csv.gz')
        print('Saving demand to',path)
        self.demand.to_csv(open(path,'w'),index = False)
        path = os.path.join(self.output_file_directory,'totalDemand.csv')
        print('Saving total demand to',path)
        self.totalDemand.reset_index().to_csv(path,index = False)
    
def main(argv):
    if len(argv) != 3:
        print('Usage:',argv[0],'<input_file_directory> <output_file_directory>')
        sys.exit(1)

    c = Combiner(argv[1], argv[2])
    c.readDatasets()
    c.computeTotalDemand()
    c.averageOverReplicates()
    c.checkTotals(0.001)
    c.output()

if __name__ == '__main__':
    main(sys.argv)
