'''this defines a class for mapping values tied to point locations to
polygons using Voronoi cells'''

import geopandas
from smart_open import open
import pandas
import numpy
from geovoronoi import voronoi_regions_from_coords

class Mapper(object):

    def __init__(self,epsg = 3082,id_col = 'nodeID'):
        # the default epsg is Central Texas Lambert, fipsList for
        # Houston; the default idColumn is for node based data
        self.epsg = epsg
        self.id_col = id_col
        self.block_groups = None
        self.counties = None
        self.points = None
        self.county_fips_list = []
        self.region = None
        self.shards = None

    def load_counties(self, path):
        print('Loading counties from', path)
        self.counties = geopandas.read_file(open(path, 'rb')).to_crs(epsg = self.epsg)

    def load_point_locations(self,path = None,geodata = None):
        if (path is None and geodata is None) or \
           (path is not None and geodata is not None):
            print('Must pass either path or geodata')
            return
        if path:
            print('Loading point locations from',path)
            self.points = geopandas.read_file(open(path))
            self.points = self.points.to_crs(epsg = self.epsg)
        else:
            self.points = geodata

        # cannot do sjoin if index_right or index_left exist
        try:
            self.points = self.points.drop(['index_right'], axis=1)
        except KeyError:
            print('index_right column not present on points. Continuing')
        try:
            self.points = self.points.drop(['index_left'], axis=1)
        except KeyError:
            print('index_left column not present on points. Continuing')

        # coerce input format
        if 'NODE_ID' in self.points.columns:
            self.points.rename(columns = {'NODE_ID':'nodeID'}, inplace=True)

    def load_block_groups(self,path):
        # load block group geometries;
        # this will not work for uncompressed files
        print('Reading block groups from',path)
        self.block_groups = geopandas.read_file(open(path,'rb'))

        # filter out blocks that are all water
        self.block_groups = self.block_groups.query('ALAND > 0')

        # project
        self.block_groups = self.block_groups.to_crs(epsg = self.epsg)

    def drop_duplicate_points(self):
        self.points = self.points.drop_duplicates('geometry')

    def generate_region(self):
        containing_counties = geopandas.sjoin(self.counties, self.points, predicate='contains').drop_duplicates(subset=['COUNTYFP'], keep='first')
        self.county_fips_list = list(containing_counties['COUNTYFP'])
        self.region = containing_counties.unary_union
                
    def discord_points_outside_region(self):
        print('Discarding nodes outside the region')

        # filter on FIPS
        self.block_groups = self.block_groups[
            self.block_groups.COUNTYFP.isin(self.county_fips_list)
        ]

        # reset index so that its continuous integers
        self.points = self.points[
            self.points.within(self.region)
        ].reset_index(drop = True)
        self.ids = set(self.points[self.id_col])
        
    def make_voronoi_cells(self):
        print('Making Voronoi cells')
        polys,pts = voronoi_regions_from_coords(
            self.points.geometry,self.region
        )
        # add the voronoi cell polygons to the points
        for polyIdx,interiorPoints in pts.items():
            for pointIdx in interiorPoints:
                self.points.at[pointIdx,'voronoiCell'] = polys[polyIdx]

        # set voronoiCell as the new geometry and rename the
        # 'geometry' column so that there is no confusion between
        # self.points.geometry and self.points['geometry']
        self.points = self.points.set_geometry('voronoiCell')
        self.points = self.points.rename(
            columns = {'geometry':'location'}
        )
        # compute the cell areas
        self.points['cellArea'] = [c.area for c in self.points.geometry]

    def overlay_cells_block_groups(self):
        print('Computing intersections between cells and block groups')
        self.shards = geopandas.overlay(
            self.points[[self.id_col,'cellArea','voronoiCell']],
            self.block_groups[['GEOID','geometry']],
            how = 'intersection'
        )
        # compute the areas of the shards (intersections of block
        # groups and voronoi cells)
        self.shards['shardArea'] = [s.area for s in self.shards.geometry]

    def calc_block_averages(self,pointData,columns):
        # given point based data with self.id_col, and value columns to
        # be mapped into block groups, compute the shard area weighted
        # averages for every column; make sure the total didn't change

        # merge the data into the shards
        data_within_area = pointData[
            pointData[self.id_col].isin(self.ids)
        ]
        merged = self.shards.merge(data_within_area,on = self.id_col)

        # group the shards by GEOID and compute the averages
        results = []
        for geoid,data in merged.groupby('GEOID'):
            row = {'GEOID':geoid}
            for column in columns:
                row[column] = sum(r.shardArea/r.cellArea*r[column]
                                  for idx,r in data.iterrows())
            results.append(row)

        block_group_data = pandas.DataFrame(results)

        # compare the column totals for those nodes that fall into the
        # study are; make sure they match to within tolerance eps (1%)
        eps = 0.03
        for column in columns:
            point_total = data_within_area[column].sum()
            block_group_total = block_group_data[column].sum()
            diff = abs(block_group_total - point_total)/point_total
            if diff > eps:
                print('Total',column,'difference',diff,
                      'is greater than',eps*100,'percent')
                print('Total point data',point_total)
                print('Total block group data',block_group_total)

        return block_group_data

    def calc_data_density(self,data,columns,calcLog = True,retArea = True):
        # compute block areas, this is more accurate than using ALAND
        # + AWATER; the area is in square kilometers
        self.block_groups['area'] = [b.area*0.000001
                                    for b in self.block_groups.geometry]

        # merge the are into the passed data
        data = data.merge(self.block_groups[['GEOID','area']],on = 'GEOID')

        # compute density in kwh per square kilometer, take the log10
        for column in columns:
            # compute the density and optionally calc log10
            if calcLog:
                data[f'{column}DensityLog10'] = numpy.log10(
                    data[column]/data.area
                )
            else:
                data['f{column}Density'] = data[column]/data.area

        # drop the area column and return
        if not retArea:
            del data['area']
        return data
