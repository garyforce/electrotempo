#!/bin/python3
import sys
import csv

def generate_energies(trips_file_path, bev_file_path, consumption_factor, output_file_path):
    '''Write the trip energies to output_file_path based on the input trips and
    the defined consumption by BEV type in bev_file_path'''
    bev_consumption = get_bev_data(bev_file_path)
    trips_file = open(trips_file_path)
    output_file = open(output_file_path, 'x')
    trips_reader = csv.reader(trips_file)
    columns = next(trips_reader)
    output_file.write('vehID,EV_type,elec_consumption(kJ)\n')
    for row in trips_reader:
        veh_id = int(row[0])
        veh_type = int(row[1])
        departure_minute = float(row[2])
        arrival_minute = float(row[7])
        miles_travelled = float(row[10])
        trip_time_hours = (arrival_minute - departure_minute) / 60
        if (trip_time_hours == 0):
            # handle edge case of zero-time trips. Assume 0 mph
            miles_per_hour = 0
        else:
            miles_per_hour = miles_travelled / trip_time_hours
        # energies are in kJ, bev_consumption is in kWh. kWh * 3600 = kJ
        if miles_per_hour < 45:
            output_file.write(f'{veh_id},BEV100,{miles_travelled * bev_consumption.get("BEV100")[0] * 3600 * consumption_factor}\n')
            output_file.write(f'{veh_id},BEV200,{miles_travelled * bev_consumption.get("BEV200")[0] * 3600 * consumption_factor}\n')
            output_file.write(f'{veh_id},BEV300,{miles_travelled * bev_consumption.get("BEV300")[0] * 3600 * consumption_factor}\n')
        else:
            output_file.write(f'{veh_id},BEV100,{miles_travelled * bev_consumption.get("BEV100")[1] * 3600 * consumption_factor}\n')
            output_file.write(f'{veh_id},BEV200,{miles_travelled * bev_consumption.get("BEV200")[1] * 3600 * consumption_factor}\n')
            output_file.write(f'{veh_id},BEV300,{miles_travelled * bev_consumption.get("BEV300")[1] * 3600 * consumption_factor}\n')

    trips_file.close()
    output_file.close()

def get_bev_data(bev_file_path):
    '''Generate `dictionary({string, tuple})` for `bev_type` and `(city_consumption,
    town_consumption)`'''
    bevs = {}
    with open(bev_file_path) as bev_file:
        bev_reader = csv.reader(bev_file)
        columns = next(bev_reader)
        bev100_row = next(bev_reader)
        bev100 = (float(bev100_row[4]),float(bev100_row[5]))
        bevs['BEV100'] = bev100
        bev200_row = next(bev_reader)
        bev200 = (float(bev200_row[4]),float(bev200_row[5]))
        bevs['BEV200'] = bev200
        bev300_row = next(bev_reader)
        bev300 = (float(bev300_row[4]),float(bev300_row[5]))
        bevs['BEV300'] = bev300
    return bevs

if __name__ == '__main__':
    if len(sys.argv) != 5:
        print(f'Usage: {sys.argv[0]} <trips_csv> <bev_csv> <consumption_factor> <output_file>')
        exit(1)
    generate_energies(sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4])
    