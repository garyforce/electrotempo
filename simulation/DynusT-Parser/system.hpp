#include <vehicle.hpp>
#include <map>

class System
{
  map<int, Vehicle *> vehicles; // map from vehID to Vehicle pointers
  map<pair<int, int>, double> lnkLen;

public:
  void parseVehicle(char *vehicleFile);
  void parseVehTraj(char *vehTrajectoryFile);
  void readLinkInfo(char *linkFile);
  void outputTrips(char *outputFile);
};
