#include <map>
#include <vector>
#include <random>
#include <string>
#include <chrono>

class Trip;

using namespace std;

class Empirics
{
    map<double, string> cumulativeMarketShare;
    map<string, double> bevBatteryCapacity;
    map<string, double> bevRange;
    map<int, double> startHomeFirstProbability; // key is hourID
    map<int, double> startHomeNotFirstProbability;
    map<int, double> firstTripProbability;
    map<int, double> lastTripProbability;
    map<int, double> startOfficeProbability;
    map<int, double> endHomeLastProbability;
    map<int, double> endOfficeLastProbability;
    map<int, double> endHomeNotLastProbability;
    map<int, double> endOfficeNotLastProbability;
    double totFirstTripProb;
    map<int, double> priorDistMean;
    map<int, double> priorDistStd;
    map<int, lognormal_distribution<double>> logPriorDist;
    gamma_distribution<double> rangeAnxietyDist;
    map<double, int> cumNHTSarr;
    map<double, int> cumNHTSdep;
    map<pair<string, int>, vector<double>> consumption; // key is a pair
                                                        // of BEV label
                                                        // and hourID
public:
    Empirics(string paramCSV, string bevCSV, gamma_distribution<double> rngAnxDist);
    string randomBEV(); // return BEV name or "nonBEV"
    double generatePriorDistance(int hour);
    double generateConsumption(string bevName, int hour);
    double generateRangeAnxiety();
    bool lastTrip(int hour);
    bool startOffice(int hour);
    bool notFirstHome(int hour);
    int lastTripDestType(int hour);
    int notLastTripDestType(int hour);
    int firstTripHour();
    double getRange(string bevName);
    double getCapacity(string bevName);
    void updateConsumptionRates(string bevName, int hour, double rate);
    void adjustLastTripProba(double lastTripFrac, map<int, int> tripCount);
    void localize(map<int, int> tripsByArr, map<int, int> tripsByDep);
    void outputDist(map<int, double> dist, string name);
};
