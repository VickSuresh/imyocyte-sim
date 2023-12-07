# iMyocyte Simulator

## Description
This react app simulates a graph cellular automata network,
meant to resemble cardiac myocytes.

## Running the app
1. Clone the repo to your local machine. 
2. Run `npm run start` in the command line to start the app.

## Basic Usage
Wherever you click in the main box, a new graph node will appear. You can press the
'Generate Nodes' button to randomly generate 100 nodes, each connected to a few of it's neighbours. 

### Delete Mode
When in delete mode, click a node to delete it. 

### Connect Mode
When in connect mode, click a node, then another node to connect them together.

### Signal Mode
When in signal mode, click a node to send out a signal. 

## Parameters
Within the graph component (`/src/Components/Graph/index.tsx`), you can modify:

- The probability that a signal propagates. Default = 1
- The refractory period. Default = 400ms.
