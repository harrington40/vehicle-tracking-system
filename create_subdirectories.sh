#!/bin/bash

# Check if the current directory is "my-grpc-nextjs-app"
CURRENT_DIR=${PWD##*/}

if [ "$CURRENT_DIR" == "my-grpc-nextjs-app" ]; then
    echo "Inside $CURRENT_DIR. Creating subdirectories and files..."

    # Create subdirectories and files
    mkdir -p grpc-server/protos
    touch grpc-server/protos/service.proto
    touch grpc-server/server.js
    touch grpc-server/package.json

    mkdir -p lib
    touch lib/grpcClient.js

    mkdir -p pages
    touch pages/index.js
    touch pages/_app.js

    mkdir -p public

    mkdir -p styles
    touch styles/globals.css

    # Create other essential files
    touch next.config.js
    touch package.json
    touch README.md

    echo "Project structure created successfully."
else
    echo "Error: Please run this script from inside the 'my-grpc-nextjs-app' directory."
fi
