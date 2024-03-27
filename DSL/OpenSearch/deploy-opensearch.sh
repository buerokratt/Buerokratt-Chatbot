#!/bin/bash

URL="http://opensearch-node:9200"
AUTH="admin:admin"

# Notifications
curl -XDELETE "$URL/notifications?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/notifications" -ku "$AUTH" --data-binary "@fieldMappings/notifications.json"

# Chat Queue
curl -XDELETE "$URL/chatqueue?ignore_unavailable=true" -u "$AUTH" --insecure
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/chatqueue" -ku "$AUTH" --data-binary "@fieldMappings/chatqueue.json"
