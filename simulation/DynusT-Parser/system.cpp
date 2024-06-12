#include "csv.h"
#include <map>
#include <set>
#include <cmath>
#include <vector>
#include <string>
#include <fstream>
#include <iostream>
#include <functional>
#include <boost/lexical_cast.hpp>
#include <boost/filesystem.hpp>
#include <boost/algorithm/string.hpp>
#include <boost/iostreams/filtering_stream.hpp>
#include "cut.hpp"
#include "system.hpp"

using namespace std;
using namespace io;
using namespace boost;
using namespace boost::iostreams;

void System::parseVehicle(char *vehicleFile)
{
  cerr << "Parsing " << vehicleFile << "\n";
  filtering_istream in;
  ifstream vehFile(vehicleFile, ios_base::binary);
  in.push(vehFile);

  // read lines and parse the vehicles
  int lineNumber = 0;
  string line;
  while (getline(in, line))
  {
    // skip the first two lines and odd lines
    if (lineNumber < 2 || lineNumber % 2 == 1)
    {
      ++lineNumber;
      continue;
    }

    // make new vehicle and assign ID and originLinkFrac
    Vehicle *vehicle = new Vehicle();
    vehicle->parseVehicleHeader(line);
    vehicles[vehicle->ID] = vehicle;
    ++lineNumber;
  }
  // close the ifstream
  vehFile.close();
}
void System::parseVehTraj(char *vehTrajectoryFile)
{
  cerr << "Parsing " << vehTrajectoryFile << "\n";
  filtering_istream in;
  ifstream trajFile(vehTrajectoryFile, ios_base::binary);
  in.push(trajFile);

  vector<string> block;
  string line;

  // skip a line
  getline(in, line);

  // naive check of VehTrajectory format
  string header ("****  Output file for vehicles trajectories: FormatCode C ****");
  getline(in, line);
  boost::trim_right(line);
  if (header.compare(line) != 0) {
    cerr << "VehTrajectory header does not match expected format\n";
    cerr << "  Expected: " << header << '\n';
    cerr << "  Received: " << line << '\n';
    exit(1);
  }

  // skip the next 3 lines
  for (int i = 0; i < 3; ++i)
    getline(in, line);

  // read lines and parse the blocks
  while (getline(in, line))
  {
    bool header = line.compare(0, 3, "Veh") == 0;
    bool incomplete = line.compare(1, 3, "###") == 0;
    // start of a new vehicle block
    if (header or incomplete)
    {
      // conditionally parse the previous block
      if (block.size() > 0)
      {
        int vehID = lexical_cast<int>(cut(block[0], 5, 9));
        auto vehicle = vehicles[vehID];
        vehicle->parseTrajBlock(block);
        // vehicle->print();
      }

      // empty the block
      block.clear();
    }

    // stop if reached the section of vehicles still in the
    // network--these vehicles have not reacher their destination and
    // we cannot take these trips into account; usually incomplete
    // trips are < 0.1% of all trips
    if (incomplete)
      break;

    // otherwise add the line to the block
    block.push_back(line);
  }
  trajFile.close();
}
void System::readLinkInfo(char *linksFile)
{
  // read link lengths
  CSVReader<2, trim_chars<' '>> in(linksFile);
  in.read_header(ignore_extra_column, "linkID", "length");
  double length;
  string linkID;
  vector<string> tokens;
  while (in.read_row(linkID, length))
  {
    split(tokens, linkID, is_any_of("-"), token_compress_on);
    int aNode = lexical_cast<int>(tokens[0]);
    int bNode = lexical_cast<int>(tokens[1]);
    lnkLen[make_pair(aNode, bNode)] = length; // miles
  }
}
void System::outputTrips(char *outputFile)
{
  cerr << "Writing trips.csv\n";
  ofstream trips(outputFile);
  trips << "vehID,vehType,departMinute,originAnode,originBnode,"
        << "originLinkFrac,originZone,arriveMinute,destNode,"
        << "destZone,vmt" << endl;
  for (const auto &[ID, vehicle] : vehicles)
  {
    // skip vehicles without trajectory or nodeArrivalTimes
    if (vehicle->trajectory.empty() or vehicle->nodeArrivalTimes.empty())
      continue;
    // cerr << "Processing " << ID << endl;
    // vehicle->print();
    trips << ID << ","
          << vehicle->vehType << ","
          << vehicle->startTime << ","
          << vehicle->upstreamNode << ","
          << vehicle->trajectory.front() << ","
          << vehicle->originLinkFrac << ","
          << vehicle->origZone << ","
          << vehicle->nodeArrivalTimes.back() << ","
          << vehicle->trajectory.back() << ","
          << vehicle->destZone << ","
          << vehicle->tripLength(lnkLen) << endl;
  }
  trips.close();
}
