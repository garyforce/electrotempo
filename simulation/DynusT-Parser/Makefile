CC = g++
CFLAGS = -I.
DEPS = vehicle.hpp system.hpp cut.hpp
LIBS = -l boost_system -l boost_iostreams -l boost_filesystem -l pthread 
OBJ = makeTrips.o system.o vehicle.o cut.o
CPPS = makeTrips.cpp system.cpp vehicle.cpp cut.cpp

%.o: %.cpp $(DEPS)
	$(CC) -std=c++1z -c -O2 $(CFLAGS) -o $@ $< 

trips: $(OBJ)
	$(CC) -O2 -o makeTrips.exe $(OBJ) $(LIBS)

clean:
	rm -f *.o *~
