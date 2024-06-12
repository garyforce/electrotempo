#include <cmath>
#include <set>
#include <iostream>
#include <fstream>
#include <algorithm>
#include <system.hpp>
#include <empirics.hpp>
#include <trip.hpp>
#include "csv.h"

using namespace std;
using namespace io; // CSV reader namespace

// hard code the range anxiety distribution shape
const double shape = 3.523;
const double officeChargeRate = 7.2 * 3600; // 7.2 kW in kJ/h
// const double homeChargeRate = 2.4*3600;

// define the list of vehIDs for light duty vehicles
int ids[] = {1, 2, 3, 4};
set<int> ldvIds(ids, ids + 4);

// constructor
System::System(int numRepl, string paramCSV, string bevCSV, string externalStationsFilePath, double rangeAnxiety)
{
    numberReplicates = numRepl;
    double scale = rangeAnxiety / shape;
    gamma_distribution<double> rngAnxDist(shape, scale);
    generator = new Empirics(paramCSV, bevCSV, rngAnxDist);

    if (externalStationsFilePath.length() > 0) {
        readExternalStations(externalStationsFilePath);
    }
}

void System::readTrips(string tripsCSV)
{
    CSVReader<11> in(tripsCSV.c_str());
    in.read_header(ignore_extra_column,
                   "vehID", "vehType", "departMinute",
                   "originAnode", "originBnode", "originLinkFrac",
                   "originZone", "arriveMinute", "destNode",
                   "destZone", "vmt");

    double len, frac, departMin, arriveMin;
    int vehID, vehType, aNode, bNode, destNode, origZone, destZone;
    while (in.read_row(vehID, vehType, departMin, aNode, bNode, frac,
                       origZone, arriveMin, destNode, destZone, len))
    {
        // skip trucks
        if (ldvIds.find(vehType) == ldvIds.end())
            continue;

        // skip trips that start or end at external stations
        if (externalStations.find(origZone) != externalStations.end() or
            externalStations.find(destZone) != externalStations.end())
        {
            continue;
        }

        Trip *trip = new Trip(aNode, bNode, frac, destNode,
                              departMin, arriveMin, len, generator);
        nodes.insert(aNode);
        nodes.insert(bNode);
        nodes.insert(destNode);
        trips[vehID] = trip;
    }
    numberTrips = trips.size();
}

void System::readTripEnergies(string energyCSV)
{
    CSVReader<3> in(energyCSV.c_str());
    in.read_header(ignore_extra_column,
                   "vehID", "EV_type", "elec_consumption(kJ)");
    int vehID;
    string bevName;
    double energy;
    while (in.read_row(vehID, bevName, energy))
    {
        // skip if this vehID does not exist
        if (trips.find(vehID) == trips.end())
            continue;

        // save the energy consumed by bevName on this trip
        auto trip = trips[vehID];
        trip->assignEnergy(bevName, energy);

        // add the energy consumption rate to the list by BEV name
        generator->updateConsumptionRates(bevName, trip->arriveHour,
                                          energy / trip->length);
    }
}

void System::readExternalStations(string externalStationsFilePath)
{
    std::fstream externalStationsFile(externalStationsFilePath, std::ios_base::in);

    int a;
    while (externalStationsFile >> a)
    {
        externalStations.insert(a);
    }
}

void System::simulateDemand()
{
    for (auto [vehID, trip] : trips)
    {
        // cerr << " Processing " << vehID << " ";
        // trip->print();

        // update the public and home Demand data structures
        trip->generateDemand(numberReplicates, officeChargeRate,
                             homeSum, homeSum2,
                             officeSum, officeSum2,
                             publicSum, publicSum2,
                             generatedVMT, actualVMT);
    }
}

void System::outputDemand(string outputFile)
{
    // for every node,hour combination add up the public and home
    // charging demands and compute the square root of the sum of the
    // variances of the demands from trips that start or end on the node
    ofstream fh;
    fh.open(outputFile.c_str());
    fh << "nodeID,hourID,"
       << "homeDemand,homeDemandStd,"
       << "officeDemand,officeDemandStd,"
       << "publicDemand,publicDemandStd,"
       << "generatedVMT,actualVMT" << endl;

    for (auto nodeID : nodes)
    {
        for (int hour = 0; hour < 24; ++hour)
        {
            // output
            fh << nodeID << "," << hour << ","
               << homeSum[nodeID][hour] << ","
               << sqrt(homeSum2[nodeID][hour]) << ","
               << officeSum[nodeID][hour] << ","
               << sqrt(officeSum2[nodeID][hour]) << ","
               << publicSum[nodeID][hour] << ","
               << sqrt(publicSum[nodeID][hour]) << ","
               << generatedVMT[nodeID][hour] << ","
               << actualVMT[nodeID][hour] << endl;
        }
    }
    fh.close();
}

void System::localize()
{
    // count the trips
    map<int, int> tripsByArr;
    map<int, int> tripsByDep;
    for (auto [ID, trip] : trips)
    {
        tripsByArr[trip->arriveHour]++;
        tripsByDep[trip->departHour]++;
    }

    // localize all emprical distributions
    generator->localize(tripsByArr, tripsByDep);
}
