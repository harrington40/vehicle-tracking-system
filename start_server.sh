#!/bin/bash

# Specify the port to check
PORT=3000

# Find the PID of the process using the port
echo "Checking for processes using port $PORT..."
PID=$(lsof -t -i:$PORT)

if [ -n "$PID" ]; then
  echo "Found process using port $PORT: PID $PID"
  echo "Attempting to terminate PID $PID..."
  kill -9 $PID
  if [ $? -eq 0 ]; then
    echo "Process $PID terminated successfully."
  else
    echo "Failed to terminate process $PID. You may need elevated permissions."
    exit 1
  fi
else
  echo "No process found using port $PORT."
fi

# Extra check with fuser to ensure port is freed
fuser -k $PORT/tcp

# Allow a brief delay for the port to free up
sleep 2

# Start the server
echo "Starting the server..."
npm run dev
