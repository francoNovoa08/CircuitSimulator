#!/bin/bash
cd "$(dirname "$0")"

em++ -std=c++20 -O2 \
  ../CircuitSimulator/parser.cpp \
  ../CircuitSimulator/circuit.cpp \
  ../CircuitSimulator/sim_api.cpp \
  -I ../CircuitSimulator \
  -o public/circuit_sim.js \
  -sEXPORTED_FUNCTIONS='["_runDC","_runAC","_runTransient"]' \
  -sEXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -sALLOW_MEMORY_GROWTH=1 \
  -sNO_EXIT_RUNTIME=1 \
  -sENVIRONMENT=web