#!/bin/bash

URL="http://localhost:9200"
AUTH="admin:admin"

#clear
curl -XDELETE "$URL/*" -u "$AUTH" --insecure

# Notifications
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/notifications" -ku "$AUTH" --data-binary "@fieldMappings/notifications.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/notifications/_bulk" -ku "$AUTH" --data-binary "@mock/notifications.json"

# Chat Queue
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/chatqueue" -ku "$AUTH" --data-binary "@fieldMappings/chatqueue.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "$URL/chatqueue/_bulk" -ku "$AUTH" --data-binary "@mock/chatqueue.json"
