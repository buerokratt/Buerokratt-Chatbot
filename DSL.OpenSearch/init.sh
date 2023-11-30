#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#SSE events
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/notifications" -ku admin:admin --data-binary "@fieldMappings/notifications.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/notifications/_bulk" -ku admin:admin --data-binary "@mock/notifications.json"
