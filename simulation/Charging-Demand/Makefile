CC = g++
CFLAGS = -std=c++1z -I.
DEPS = system.hpp empirics.hpp trip.hpp
LIBS = -l pthread 
OBJ = simulateDemand.o system.o empirics.o trip.o
CPPS = simulateDemand.cpp system.cpp empirics.cpp trip.cpp

%.o: %.cpp $(DEPS)
	$(CC) -c -O2 -o $@ $< $(CFLAGS)

sim: $(OBJ)
	$(CC) -O2 -o simulate $(OBJ) $(LIBS)

debug: $(CPPS)
	$(CC) -std=c++0x -Wall -fPIC $(CFLAGS) -o simulate -ggdb $(CPPS) $(LIBS)

clean:
	rm -f *.o *~
