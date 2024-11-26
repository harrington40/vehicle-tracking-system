#!/bin/bash

# Port number to search for
PORT=50051

# Find the process using the specified port and extract the process ID (PID)
PID=$(lsof -t -i:$PORT)

if [ -n "$PID" ]; then
  echo "Terminating process using port $PORT (PID: $PID)"
  kill -9 $PID
  echo "Process terminated."
else
  echo "No process found using port $PORT."
fi

# Navigate to the directory containing the script
SCRIPT_DIR="/home/harrington4/Design_Project2020/programming/expo/telematic-tracking-system/server"
cd $SCRIPT_DIR || { echo "Failed to navigate to $SCRIPT_DIR. Exiting."; exit 1; }

# Restart the script using Node.js
SCRIPT_NAME="grpcServer.js" # Replace with the name of your script if different

if [ -f "$SCRIPT_NAME" ]; then
  echo "Starting $SCRIPT_NAME with Node.js"
  node $SCRIPT_NAME
else
  echo "Script $SCRIPT_NAME not found in $SCRIPT_DIR. Exiting."
fi

# End of script
