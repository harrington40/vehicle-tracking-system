#!/bin/bash

# Define the starting port
START_PORT=3003
PORT=$START_PORT

# Function to check if a port is in use (both IPv4 and IPv6)
is_port_in_use() {
  sudo lsof -iTCP:$1 -sTCP:LISTEN > /dev/null || sudo netstat -tuln | grep -q ":::$1"
}

# Loop to find the first available port
while is_port_in_use $PORT; do
  echo "⚠ Port $PORT is in use, trying next port..."
  
  # Kill any process on this port using fuser (handles both IPv4 and IPv6)
  echo "Killing any process using port $PORT..."
  sudo fuser -k ${PORT}/tcp
  
  # Increment the port number to check the next port
  ((PORT++))
done

# Start the application
echo "Starting application on available port: $PORT..."
PORT=$PORT npm run dev
