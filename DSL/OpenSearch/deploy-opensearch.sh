#!/bin/bash

URL=$1
AUTH=$2

if [[ -z $URL || -z $AUTH ]]; then
  echo "Url and Auth are required"
  exit 1
fi

# Notifications
curl -XDELETE "$URL/notifications?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/notifications" -ku "$AUTH" --data-binary "@fieldMappings/notifications.json"

# Chat Queue
curl -XDELETE "$URL/chatqueue?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/chatqueue" -ku "$AUTH" --data-binary "@fieldMappings/chatqueue.json"
