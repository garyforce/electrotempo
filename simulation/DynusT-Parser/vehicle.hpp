#include <string>
#include <vector>
#include <map>

using namespace std;

class Vehicle {
public:
  int upstreamNode; // A node of the origin link
  double originLinkFrac;
  vector<int> trajectory; // nodeIDs
  double startTime; // in min from midnight
  vector<double> nodeArrivalTimes; // same as startTime
  int vehType;
  int ID;
  int origZone;
  int destZone;
  void parseVehicleHeader(string&);
  void parseTrajBlock(vector<string>&);
  double tripLength(map<pair<int,int>,double>&);
  void print();
};
