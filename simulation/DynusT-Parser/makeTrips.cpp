#include <iostream>
#include "system.hpp"

int main(int argc, char *argv[])
{
  if (argc != 5)
  {
    cout << "Usage: ./makeTrips.exe <links.csv> <VehTrajectory.dat> <output_vehicle.dat>\n";
    return 0;
  }
  char *linksFile = argv[1];
  char *vehicleFile = argv[2];
  char *vehTrajectoryFile = argv[3];
  char *outputFile = argv[4];
  System *s = new System();
  s->readLinkInfo(linksFile);
  s->parseVehicle(vehicleFile);
  s->parseVehTraj(vehTrajectoryFile);
  s->outputTrips(outputFile);
}
