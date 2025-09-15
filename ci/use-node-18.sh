#!/usr/bin/env bash
set -euo pipefail

# Install/activate Node 18 with nvm
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  # Install nvm (cached per agent HOME)
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

nvm install 18 >/dev/null
nvm use 18    >/dev/null

node -v

# Avoid Corepack to bypass locked egress to repo.yarnpkg.com
# Install Yarn classic globally via npm; ignore failure and fallback to npm later
if ! command -v yarn >/dev/null 2>&1; then
  npm install -g yarn@1.22.22 || true
fi

# Show available package managers for logs
(yarn -v || echo "yarn not available, will use npm")
npm -v
