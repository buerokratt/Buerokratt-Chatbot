#!/bin/bash

URL=$1
AUTH=$2
MOCK_ALLOWED=${3:-false}

if [[ -z $URL || -z $AUTH ]]; then
  echo "Url and Auth are required"
  exit 1
fi

# Notifications
curl -XDELETE "$URL/notifications?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/notifications" -ku "$AUTH" --data-binary "@fieldMappings/notifications.json"
if $MOCK_ALLOWED; then curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/notifications/_bulk" -ku "$AUTH" --data-binary "@mock/notifications.json"; fi

# Chat Queue
curl -XDELETE "$URL/chatqueue?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/chatqueue" -ku "$AUTH" --data-binary "@fieldMappings/chatqueue.json"
if $MOCK_ALLOWED; then curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/chatqueue/_bulk" -ku "$AUTH" --data-binary "@mock/chatqueue.json"; fi

