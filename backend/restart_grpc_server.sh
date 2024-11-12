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

# Restart the script using node
SCRIPT_NAME="authServer.js" # Replace with the name of your script if different

echo "Starting $SCRIPT_NAME with Node.js"
node $SCRIPT_NAME

# End of script
