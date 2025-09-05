#!/usr/bin/env bash
set -euo pipefail

# ========= CONFIG =========
BUCKET="${1:-Container1}"  # default bucket name, can pass as first argument
PROFILE="backblaze"
ENDPOINT="https://s3.us-west-002.backblazeb2.com"
# ==========================

YEAR="$(date +%Y)"
MONTH="$(date +%m)"

create_prefix() {
  local key="$1"
  echo "Creating folder s3://$BUCKET/$key"
  aws s3api put-object \
    --bucket "$BUCKET" \
    --key "$key" \
    --profile "$PROFILE" \
    --endpoint-url "$ENDPOINT" >/dev/null
}

echo "Bucket: $BUCKET"
echo "Profile: $PROFILE"
echo "Endpoint: $ENDPOINT"
echo

# Top-level
create_prefix "documents/"
create_prefix "images/"
create_prefix "logs/"

# Documents subfolders
create_prefix "documents/reports/"
create_prefix "documents/invoices/"

# Images subfolders
create_prefix "images/vacation/"
create_prefix "images/profile/"

# Logs with date
create_prefix "logs/${YEAR}/"
create_prefix "logs/${YEAR}/${MONTH}/"

echo
echo "Folder structure created successfully."

# Optional: list result
aws s3 ls "s3://$BUCKET/" --recursive --profile "$PROFILE" --endpoint-url "$ENDPOINT"
