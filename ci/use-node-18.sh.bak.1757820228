#!/usr/bin/env bash
set -euo pipefail
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
. "$NVM_DIR/nvm.sh"
nvm install 18 >/dev/null
nvm use 18 >/dev/null
node -v
corepack enable || true
corepack prepare yarn@stable --activate || true
yarn -v || true
