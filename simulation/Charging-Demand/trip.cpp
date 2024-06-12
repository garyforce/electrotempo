#include <iostream>
#include <trip.hpp>
#include <empirics.hpp>

using namespace std;

void assignCharging(double amount, int hour,
                    double frac, double chargeRate,
                    map<int, double> &sum,
                    map<int, double> &sum2)
{
    while (amount > 0.)
    {
        double inc = min(amount, frac * chargeRate);
        amount -= inc;
        sum[hour % 24] += inc;
        sum2[hour % 24] += inc * inc;
        hour++;
        frac = 1.;
    }
}

Trip::Trip(int aNode, int bNode, double frac, int dNode,
           double departMin, double arriveMin, double len,
           Empirics *gen)
{
    originAnode = aNode;
    originBnode = bNode;
    originLinkFrac = frac;
    destNode = dNode;
    departHour = int(departMin / 60.) % 24;
    arriveHour = int(arriveMin / 60.);
    // fraction of the hour that is *left*; for example when arriving at
    // 6:45 pm; arriveHourFraction = 0.25
    arriveHourFraction = 1. - arriveMin / 60. + arriveHour;
    arriveHour = arriveHour % 24; // need this when arriveMin >= 1440
    length = len;
    generator = gen;
}

bool Trip::generateBEV()
{
    bevName = generator->randomBEV();
    if (bevName == "nonBEV")
        return false;
    totalRange = generator->getRange(bevName);
    batteryCapacity = generator->getCapacity(bevName);
    return true;
}

void Trip::print()
{
    cerr << originAnode << "-" << originBnode << " -> " << destNode
         << " ; " << departHour << " -> " << arriveHour << " ; "
         << length << endl;
}

void Trip::assignEnergy(string name, double e)
{
    tripEnergy[name] = e;
}

void Trip::generateDemand(int num,
                          double officeChargeRate,
                          NodeHourMap &homeSum,
                          NodeHourMap &homeSum2,
                          NodeHourMap &officeSum,
                          NodeHourMap &officeSum2,
                          NodeHourMap &publicSum,
                          NodeHourMap &publicSum2,
                          NodeHourMap &generatedVMT,
                          NodeHourMap &actualVMT)
{

    // num is the number of replicates
    // public demand sums on the origin link A and B nodes, at the depart
    // hour
    double aSum = 0.; // public demand on node A at the hour of departure
    double aSum2 = 0.;
    double bSum = 0.; // public demand on node B at the hour of departure
    double bSum2 = 0.;
    double genVMT = 0.;
    double actVMT = 0.;
    map<int, double> hSum;  // night time home charging by hour
    map<int, double> hSum2; // sums of the squared demand increments
    map<int, double> oSum;  // office charging by hour
    map<int, double> oSum2; // sum of squared demand increments
    double remainingRange;
    double delta;

    // for all replicates
    for (int i = 0; i < num; ++i)
    {
        // skip if not a BEV
        if (!this->generateBEV())
            continue;

        // record the actual EV VMT
        actVMT += length;

        // first deal with demand that would be assigned to the origin
        // link of the trip

        // generate the prior traveled distance
        double priorDist = generator->generatePriorDistance(departHour);
        // cerr << i << " prior distance: " << priorDist;

        // this block only needs doing if priorDist > 0. and not starting
        // from home (on a non-first trip of the day)
        if (priorDist > 0. and not generator->notFirstHome(departHour))
        {
            // generate the energy consumed since the start of the day
            double rate = generator->generateConsumption(bevName, departHour);
            double priorEnergyConsumed = priorDist * rate;
            // cerr << " consumption: " << rate;

            // compute the energy remaining after this trip is taken; use
            // the actual energy consumed on this trip
            // this is the remaining range at the start of this trip
            double remainingEnergy = batteryCapacity - priorEnergyConsumed - tripEnergy[bevName];
            remainingRange = remainingEnergy / batteryCapacity * totalRange;

            // generate the range anxiety
            double rangeAnxiety = generator->generateRangeAnxiety();
            // cerr << " range anxiety: " << rangeAnxiety;

            // account for the daytime public charging that may have happened;
            // because of it, the remaining range can never be less than the
            // range anxiety
            if (remainingRange < rangeAnxiety)
                remainingRange = rangeAnxiety;

            // the difference to be added by public fast charging
            delta = length + rangeAnxiety - remainingRange;

            // regularize delta so that delta >=0 and the range after public
            // charging is not greater than totalRange
            if (delta > totalRange - remainingRange)
            {
                delta = totalRange - remainingRange;
            }
            else if (delta < 0.)
            {
                delta = 0.;
            }

            // update generated VMT by delta
            genVMT += delta;

            // update the public demand sums using delta as the amount of
            // range added; assign public demand to both A and B nodes of the
            // origin link using the originLinkFrac
            if (delta > 0.)
            {
                // convert the extra range into energy using batteryCapacity
                double e = delta / totalRange * batteryCapacity;
                double s = e * originLinkFrac;
                bSum += s;
                bSum2 += s * s;
                aSum += e - s;
                aSum2 += (e - s) * (e - s);
            }
        }
        else
        {
            // get here if priorDist == 0
            delta = 0.;
            remainingRange = totalRange;
        }

        // here we deal with demand at the end of the trip: nighttime home
        // or office demand

        // compute the total energy to full battery at the end of the trip
        // taking into account the public charging that took place

        // remaining range at the end of the trip
        remainingRange = remainingRange + delta - length;
        // remaining range cannot be negative
        if (remainingRange < 0.)
            remainingRange = 0.;

        double energyToFull = batteryCapacity * (1. - remainingRange / totalRange);
        // is this the last trip of the day?
        if (generator->lastTrip(arriveHour))
        {

            // where did the last trip terminate?
            int destType = generator->lastTripDestType(arriveHour);
            if (destType == 1)
            { // arrived home
                // generate the start hour of the first trip next day
                int nextDepartHour = generator->firstTripHour();

                // compute the length of the charging window (in hours)
                // assuming the next day's trip starts in the middle of the
                // first hour
                double window = (nextDepartHour + 23 - arriveHour) % 24 + 0.5 + arriveHourFraction;

                // compute the required charing rate
                double homeChargeRate = energyToFull / window;

                // update the demand sums
                assignCharging(energyToFull, arriveHour, arriveHourFraction,
                               homeChargeRate, hSum, hSum2);
            }
            else if (destType == 2)
            { // last trip arrives to office
                assignCharging(energyToFull, arriveHour, arriveHourFraction,
                               officeChargeRate, oSum, oSum2);
            }
        }
        else
        {
            // not the last trip
            int destType = generator->notLastTripDestType(arriveHour);
            if (destType == 2)
            { // office
                assignCharging(energyToFull, arriveHour, arriveHourFraction,
                               officeChargeRate, oSum, oSum2);
            }
        }
        // finished with the replicate
    } // replicate loop

    // average over replicates and update the demand data structures
    aSum /= num;
    aSum2 /= num;
    bSum /= num;
    bSum2 /= num;
    publicSum[originAnode][departHour] += aSum;
    publicSum[originBnode][departHour] += bSum;
    publicSum2[originAnode][departHour] += (aSum2 - aSum * aSum);
    publicSum2[originBnode][departHour] += (bSum2 - bSum * bSum);
    generatedVMT[destNode][arriveHour] += genVMT / num;
    actualVMT[destNode][arriveHour] += actVMT / num;

    for (int hour = 0; hour < 24; hour++)
    {
        hSum[hour] /= num;
        hSum2[hour] /= num;
        oSum[hour] /= num;
        oSum2[hour] /= num;
        homeSum[destNode][hour] += hSum[hour];
        homeSum2[destNode][hour] += (hSum2[hour] - hSum[hour] * hSum[hour]);
        officeSum[destNode][hour] += oSum[hour];
        officeSum2[destNode][hour] += (oSum2[hour] - oSum[hour] * oSum[hour]);
    }

    // diagnostic output for the public demand
    // cerr << originAnode << " " << aSum << " "
    //      << originBnode << " " << bSum << endl;
}
