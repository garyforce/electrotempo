#include <fstream>
#include <iostream>
#include <string>
#include <random>
#include <empirics.hpp>
#include "csv.h"

using namespace io; // the csv library namespace

// init the random numbers
unsigned seed = chrono::system_clock::now().time_since_epoch().count();
default_random_engine randGen(seed);
uniform_real_distribution<double> randUni(0, 1);

Empirics::Empirics(string paramCSV, string bevCSV, gamma_distribution<double> rngAnxDist)
{
    rangeAnxietyDist = rngAnxDist;
    // paramCSV is the path to the CSV with all of the empirical
    // distriution parameters; bevCSV is a CSV with battery
    // capacity, range, and market share

    // read the distribution parameters
    CSVReader<14> inParam(paramCSV.c_str());
    inParam.read_header(ignore_extra_column,
                        "hourID", "startHomeFirstProb",
                        "startHomeNotFirstProb", "startOfficeProb",
                        "endHomeLastProb", "endOfficeLastProb",
                        "endHomeNotLastProb", "endOfficeNotLastProb",
                        "firstTripProb", "lastTripProb",
                        "logDayDistMean", "logDayDistStd",
                        "cumTripFracArrive", "cumTripFracDepart");
    int hour;
    double startHomeFirst, startHomeNotFirst, startOffice, endOfficeLast,
        endOfficeNotLast, endHomeLast, endHomeNotLast,
        firstTrip, lastTrip, mu, std, frArr, frDep;
    totFirstTripProb = 0.;
    while (inParam.read_row(hour, startHomeFirst, startHomeNotFirst,
                            startOffice, endHomeLast, endOfficeLast,
                            endHomeNotLast, endOfficeNotLast,
                            firstTrip, lastTrip, mu, std, frArr, frDep))
    {
        startHomeFirstProbability[hour] = startHomeFirst;
        startHomeNotFirstProbability[hour] = startHomeNotFirst;
        startOfficeProbability[hour] = startOffice;
        endHomeLastProbability[hour] = endHomeLast;
        endOfficeLastProbability[hour] = endOfficeLast;
        endHomeNotLastProbability[hour] = endHomeNotLast;
        endOfficeNotLastProbability[hour] = endOfficeNotLast;
        firstTripProbability[hour] = firstTrip;
        lastTripProbability[hour] = lastTrip;
        priorDistMean[hour] = mu;
        priorDistStd[hour] = std;
        cumNHTSarr[frArr] = hour;
        cumNHTSdep[frDep] = hour;
    }

    // add the 0 cumulative fraction for the day start (hour 3)
    cumNHTSarr[0.] = 3;
    cumNHTSdep[0.] = 3;

    // read the BEV descriptions
    CSVReader<4> inBEVdesc(bevCSV.c_str());
    inBEVdesc.read_header(ignore_extra_column,
                          "bevName", "totalRangeMiles",
                          "batteryCapacityKWh", "marketFraction");
    string name;
    double range, capacity, fraction;
    double cumFrac = 0;
    while (inBEVdesc.read_row(name, range, capacity, fraction))
    {
        bevBatteryCapacity[name] = 3600. * capacity; // in kJ
        bevRange[name] = range;                      // in miles
        cumFrac += fraction;
        cumulativeMarketShare[cumFrac] = name;
    }
    // the total market share is 1, the rest are nonBEVs
    cumulativeMarketShare[1.] = "nonBEV";
}

double Empirics::generateRangeAnxiety()
{
    return rangeAnxietyDist(randGen);
}

string Empirics::randomBEV()
{
    return cumulativeMarketShare.lower_bound(randUni(randGen))->second;
}

double Empirics::generatePriorDistance(int hour)
{
    // return 0 if start from office OR this is the first trip of the
    // day and starting from home
    bool startOffice = randUni(randGen) < startOfficeProbability[hour];
    bool firstTrip = randUni(randGen) < firstTripProbability[hour];
    bool startHome = randUni(randGen) < startHomeFirstProbability[hour];
    bool fullBatt = startOffice or (firstTrip and startHome);
    return fullBatt ? 0. : logPriorDist[hour](randGen);
}

double Empirics::generateConsumption(string bevName, int hour)
{
    auto values = consumption[make_pair(bevName, hour)];
    return values[int(values.size() * randUni(randGen))];
}

bool Empirics::lastTrip(int hour)
{
    return randUni(randGen) < lastTripProbability[hour];
}

bool Empirics::startOffice(int hour)
{
    return randUni(randGen) < startOfficeProbability[hour];
}

int Empirics::lastTripDestType(int hour)
{
    double shot = randUni(randGen);
    if (shot < endHomeLastProbability[hour])
    {
        return 1; // home
    }
    else if (shot < endHomeLastProbability[hour] + endOfficeLastProbability[hour])
    {
        return 2; // office
    }
    else
    {
        return 0;
    }
}

int Empirics::notLastTripDestType(int hour)
{
    double shot = randUni(randGen);
    if (shot < endHomeNotLastProbability[hour])
    {
        return 1; // home
    }
    else if (shot < endHomeNotLastProbability[hour] + endOfficeNotLastProbability[hour])
    {
        return 2; // office
    }
    else
    {
        return 0;
    }
}

bool Empirics::notFirstHome(int hour)
{
    return randUni(randGen) < startHomeNotFirstProbability[hour];
}

int Empirics::firstTripHour()
{
    double shot = randUni(randGen) * totFirstTripProb;
    double tot = 0.;
    // assume that the first trip can start at 4 am or later
    int hour;
    for (hour = 4; hour < 28; ++hour)
    {
        tot += firstTripProbability[hour % 24];
        if (shot < tot)
            break;
    }
    return hour % 24;
}

double Empirics::getRange(string name)
{
    return bevRange[name];
}

double Empirics::getCapacity(string name)
{
    return bevBatteryCapacity[name];
}

void Empirics::updateConsumptionRates(string name, int hour, double rate)
{
    consumption[make_pair(name, hour)].push_back(rate);
}

// void Empirics::adjustLastTripProba(double lastTripFrac,
// 				   map<int,int> tripCount) {
//   double s = 0.,s2 = 0.;
//   int totTrips = 0;
//   for (auto [h,c] : tripCount) {
//     s += c*lastTripProbability[h];
//     s2 += c*lastTripProbability[h]*c;
//     totTrips += c;
//   }

//   // compute the alpha factor
//   double alpha = (s - totTrips*lastTripFrac)/s2;

//   // adjust the last trip probabilities
//   cerr << "Adjustment factors\n";
//   for (auto [h,c] : tripCount) {
//     cerr << h << " " << 1. - alpha*c << endl;
//     lastTripProbability[h] *= (1. - alpha*c);
//   }
// }

map<int, double> doLocalization(map<int, double> nhtsParam,
                                map<double, int> nhtsCumul,
                                map<int, double> cumul)
{
    map<int, double> param;
    for (auto [hour, frac] : cumul)
    {
        auto upper = nhtsCumul.lower_bound(frac);
        // cerr << hour << " " << frac << " ; ";
        if (upper->first == frac)
        {
            param[hour] = nhtsParam[upper->second];
        }
        else
        {
            // interpolate
            auto lower = upper;
            lower--;
            double xl = lower->first;
            double xr = upper->first;
            double yl = nhtsParam[lower->second];
            double yr = nhtsParam[upper->second];
            // cerr << xl << " " << xr << " ; " << yl << " " << yr << " ; ";
            param[hour] = yl + (yr - yl) * (frac - xl) / (xr - xl);
        }
        // cerr << nhtsParam[hour] << " " << param[hour] << endl;
    }
    return param;
}

map<int, double> computeCumulative(map<int, int> tripCounts)
{
    // count all trips
    int numTrips = 0;
    for (auto [hour, count] : tripCounts)
        numTrips += count;
    map<int, double> cumulFrac;
    int partial = 0;
    for (int i = 4; i <= 27; i++)
    {
        int j = i % 24;
        partial += tripCounts[j];
        cumulFrac[j] = double(partial) / double(numTrips);
    }
    return cumulFrac;
}

void Empirics::outputDist(map<int, double> dist, string name)
{
    ofstream fh;
    fh.open((name + std::string(".txt")).c_str());
    fh << "hourID," << name << endl;
    for (auto [hour, value] : dist)
        fh << hour << "," << value << endl;
    fh.close();
}

void Empirics::localize(map<int, int> tripsByArrival,
                        map<int, int> tripsByDeparture)
{

    // compute cumulative trip fractions
    map<int, double> cumTripArr = computeCumulative(tripsByArrival);
    map<int, double> cumTripDep = computeCumulative(tripsByDeparture);

    // localize all properties
    cerr << "First trip probability" << endl;
    firstTripProbability = doLocalization(firstTripProbability,
                                          cumNHTSdep, cumTripDep);
    // outputDist(firstTripProbability,"firstTripProb");

    cerr << "Last trip probability" << endl;
    lastTripProbability = doLocalization(lastTripProbability,
                                         cumNHTSarr, cumTripArr);
    // outputDist(lastTripProbability,"lastTripProb");

    cerr << "End at home on last trip probability" << endl;
    endHomeLastProbability = doLocalization(endHomeLastProbability,
                                            cumNHTSarr, cumTripArr);
    // outputDist(endHomeLastProbability,"endHomeLastProb");

    cerr << "End at office on last trip probability" << endl;
    endOfficeLastProbability = doLocalization(endOfficeLastProbability,
                                              cumNHTSarr, cumTripArr);
    // outputDist(endOfficeLastProbability,"endOfficeLastProb");

    cerr << "End at home not on a last trip probability" << endl;
    endHomeNotLastProbability = doLocalization(endHomeNotLastProbability,
                                               cumNHTSarr, cumTripArr);
    // outputDist(endHomeNotLastProbability,"endHomeNotLastProb");

    cerr << "End at office not on a last trip probability" << endl;
    endOfficeNotLastProbability = doLocalization(endOfficeNotLastProbability,
                                                 cumNHTSarr, cumTripArr);
    // outputDist(endOfficeNotLastProbability,"endOfficeNotLastProb");

    cerr << "Start home on first trip probability" << endl;
    startHomeFirstProbability = doLocalization(startHomeFirstProbability,
                                               cumNHTSdep, cumTripDep);
    // outputDist(startHomeFirstProbability,"startHomeFirstProb");

    cerr << "Start home on not first trip probability" << endl;
    startHomeNotFirstProbability = doLocalization(startHomeNotFirstProbability,
                                                  cumNHTSdep, cumTripDep);
    // outputDist(startHomeNotFirstProbability,"startHomeNotFirstProb");

    cerr << "Start at the office probability" << endl;
    startOfficeProbability = doLocalization(startOfficeProbability,
                                            cumNHTSdep, cumTripDep);
    // outputDist(startOfficeProbability,"startOfficeProb");

    cerr << "Prior mean" << endl;
    priorDistMean = doLocalization(priorDistMean, cumNHTSarr, cumTripArr);
    // outputDist(priorDistMean,"priorDistMean");

    cerr << "Prior std" << endl;
    priorDistStd = doLocalization(priorDistStd, cumNHTSarr, cumTripArr);
    // outputDist(priorDistStd,"priorDistStd");

    // compute totFirstTripProb
    totFirstTripProb = 0.;
    for (auto [hour, proba] : firstTripProbability)
        totFirstTripProb += proba;

    // construct logPriorDist;
    for (int hour = 0; hour < 24; ++hour)
    {
        lognormal_distribution<double> dist(priorDistMean[hour],
                                            priorDistStd[hour]);
        logPriorDist[hour] = dist;
    }
}
