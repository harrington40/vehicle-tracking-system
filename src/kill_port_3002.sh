#!/bin/bash

# Check if any process is using port 3002
PID=$(lsof -ti :3002)

# If a PID is found, kill the process
if [ -n "$PID" ]; then
  echo "Process found on port 3002 with PID: $PID"
  echo "Killing process..."
  kill -9 $PID
  echo "Process killed."
else
  echo "No process is using port 3002."
fi

# Start the application
echo "Starting application with npm start..."
npm start
