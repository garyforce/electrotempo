#include <vector>
#include <map>
#include <string>
#include <iostream>
#include <boost/lexical_cast.hpp>
#include <boost/algorithm/string.hpp>
#include "cut.hpp"
#include "vehicle.hpp"

using namespace boost;
using namespace std;

void Vehicle::parseVehicleHeader(string &line) {
  ID = lexical_cast<int>(cut(line,0,9));
  originLinkFrac = lexical_cast<double>(cut(line,95,12));
  vehType = lexical_cast<int>(cut(line,37,6));
  startTime = lexical_cast<double>(cut(line,23,8));
  upstreamNode = lexical_cast<int>(cut(line,9,7));
}

void Vehicle::parseTrajBlock(vector<string> &block) {
  // global line index in the block
  int lineIndex = 0;
  
  // extract the origin and destination zones
  origZone = lexical_cast<int>(cut(block[lineIndex],28,5));
  destZone = lexical_cast<int>(cut(block[lineIndex],40,5));

  // get the number of traversed nodes
  int traversedNodes = lexical_cast<int>(cut(block[lineIndex],161,4));
  // cerr << ID << ": traversed nodes " << traversedNodes << endl;

  // extract the trajectory
  int nodeIndex = 0;
  int fieldWidth = 8;
  int nodeID;
  int pointer;
  int lineLength;
  string line;
  while (nodeIndex < traversedNodes) {
    ++lineIndex;
    line = block[lineIndex];
    lineLength = line.size();
    pointer = 0;
    // cerr << "Processing " << line << " of length " << lineLength << endl;
    while (pointer + fieldWidth < lineLength) {
      nodeID = lexical_cast<int>(cut(line,pointer,fieldWidth));
      trajectory.push_back(nodeID);
      ++nodeIndex;
      pointer += fieldWidth;
    }
  }

  // extract the node arrival times
  nodeIndex = 0;
  double time;
  while (nodeIndex < traversedNodes) {
    ++lineIndex;
    line = block[lineIndex];
    lineLength = line.size();
    pointer = 0;
    // cerr << "Processing " << line << " of length " << lineLength << endl;
    while (pointer + fieldWidth < lineLength) {
      time = lexical_cast<double>(cut(line,pointer,fieldWidth));
      nodeArrivalTimes.push_back(startTime + time);
      ++nodeIndex;
      pointer += fieldWidth;
    }
  }
}

void Vehicle::print() {
  cerr << "vehicle ID: " << ID << endl;
  cerr << "startTime: " << startTime << endl;
  cerr << "upstreamNode: " << upstreamNode << endl;
  cerr << "originLinkFrac: " << originLinkFrac << endl;
  cerr << "trajectory:";
  for (int node : trajectory) cerr << " " << node;
  cerr << endl;
  cerr << "nodeArrivalTimes:";
  for (double time : nodeArrivalTimes) cerr << " " << time;
  cerr << endl;
}
  
double Vehicle::tripLength(map<pair<int,int>,double>& lnkLen) {
  int Anode = upstreamNode;
  double frac = originLinkFrac;
  double vmt = 0.;
  if (trajectory.size() == 0) return vmt;
  for (auto Bnode : trajectory) {
    auto linkID = make_pair(Anode,Bnode);
    if (lnkLen.find(linkID) != lnkLen.end()) {
      vmt += frac*lnkLen[linkID];
    }
    Anode = Bnode;
    frac = 1.;
  }
  return vmt;
}  
