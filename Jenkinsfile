stage('Install dependencies') {
  steps {
    sh '''
      set -eux
      # Ensure we're using the right Node.js version - handle case where ARCH might not be set
      if [ -d "$PWD/node-v18.20.4-linux-x64" ]; then
        export PATH="$PWD/node-v18.20.4-linux-x64/bin:$PATH"
      elif [ -d "$PWD/node-v18.20.4-linux-arm64" ]; then
        export PATH="$PWD/node-v18.20.4-linux-arm64/bin:$PATH"
      elif [ -d "$PWD/node-v18.20.4-linux-armv7l" ]; then
        export PATH="$PWD/node-v18.20.4-linux-armv7l/bin:$PATH"
      fi
      
      # Prefer yarn if present with yarn.lock, else npm
      if command -v yarn >/dev/null 2>&1 && [ -f yarn.lock ]; then
        if [ "${CLEAN_NODE_MODULES:-false}" = "true" ]; then rm -rf node_modules; fi
        yarn install --frozen-lockfile || yarn install
      else
        if [ -f package-lock.json ]; then
          npm ci || npm install
        else
          npm install
        fi
      fi
    '''
  }
}