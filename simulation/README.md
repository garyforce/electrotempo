# Simulation

## subscription.js

`subscription.js` is a NodeJS program currently designed to run on Cruncher. It
listens to events emitted by SNS telling that a new set of files have been 
uploaded. When that happens, it will automatically parse the notification for
the information and download the files to begin the simulation pipeline.