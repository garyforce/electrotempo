#include <map>
#include <vector>
#include <string>

using namespace std;

typedef map<int, map<int, double>> NodeHourMap;

class Empirics;

class Trip
{
    int originAnode;
    int originBnode;
    double originLinkFrac;
    int destNode;
    string bevName;
    double totalRange;      // in miles
    double batteryCapacity; // in kJ
    Empirics *generator;
    map<string, double> tripEnergy;
    double arriveHourFraction; // from 0 to 1
public:
    double length;
    int departHour;
    int arriveHour;
    Trip(int aNode, int bNode, double frac, int dNode, double departMin,
         double arriveMin, double len, Empirics *gen);
    bool generateBEV();
    // office charge range in kJ/hour
    void generateDemand(int numRep,
                        double officeChargeRate,
                        NodeHourMap &homeSum, NodeHourMap &homeSum2,
                        NodeHourMap &officeSum, NodeHourMap &officeSum2,
                        NodeHourMap &publicSum, NodeHourMap &publicSum2,
                        NodeHourMap &generatedVMT, NodeHourMap &actualVMT);
    void print();
    void assignEnergy(string bevName, double e);
};
