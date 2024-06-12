#include <iostream>
#include <cstdlib>
#include <system.hpp>
#include <string>

using namespace std;

// the sought total fraction of last trips (from NHTS)
// double lastTripFrac = 0.24685466377;

int main(int argc, char *argv[])
{
    if (!(argc == 8 or argc == 9))
    {
        cout << "Usage: " << argv[0]
             << " numOfReplicates rangeAnxiety(mi) paramCSV bevCSV"
             << " tripsCSV energyCSV [externalStationsFile] outputCSV"
             << endl;
        return 1;
    }

    int numRepl = atoi(argv[1]);
    double rangeAnxiety = atof(argv[2]);
    string paramCSV(argv[3]);
    string bevCSV(argv[4]);
    string tripsCSV(argv[5]);
    string energyCSV(argv[6]);

    string outfile;
    string externalStationsFilePath;
    if (argc == 8)
    {
        outfile = argv[7];
    }
    else if (argc == 9)
    {
        externalStationsFilePath = argv[7];
        outfile = argv[8];
    }

    System *system = new System(numRepl, paramCSV, bevCSV, externalStationsFilePath, rangeAnxiety);
    system->readTrips(tripsCSV);
    system->readTripEnergies(energyCSV);
    cerr << "Read " << system->numberTrips << " trips" << endl;
    system->localize();
    if (numRepl > 0)
    {
        system->simulateDemand();
        system->outputDemand(outfile);
    }
}
