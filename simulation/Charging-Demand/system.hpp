#include <vector>
#include <map>
#include <set>
#include <string>

using namespace std;

class Empirics;
class Trip;
typedef map<int, map<int, double>> NodeHourMap;

class System
{
    int numberReplicates;
    map<int, Trip *> trips;
    set<int> nodes;
    set<int> externalStations;
    Empirics *generator;
    // the demand map keys nodeIDs, values are maps from hourID to a
    // vector of pairs of replicate average sum of random demands and
    // the sum over the squares (for the variance calculation
    NodeHourMap homeSum, homeSum2;
    NodeHourMap publicSum, publicSum2;
    NodeHourMap officeSum, officeSum2;
    NodeHourMap generatedVMT, actualVMT;

public:
    int numberTrips;
    System(int numRepl, string paramCSV, string bevCSV, string externalStationsFilePath, double rangeAnxiety);
    void readExternalStations(string externalStationsFilePath);
    void readTrips(string tripsCSV);
    void readTripEnergies(string energyCSV);
    void simulateDemand();
    void outputDemand(string outFilename);
    void localize();
};
