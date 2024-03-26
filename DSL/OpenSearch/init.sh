#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#notifications
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/notifications" -ku admin:admin --data-binary "@fieldMappings/notifications.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/notifications/_bulk" -ku admin:admin --data-binary "@mock/notifications.json"

#chatqueue
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/chatqueue" -ku admin:admin --data-binary "@fieldMappings/chatqueue.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/chatqueue/_bulk" -ku admin:admin --data-binary "@mock/chatqueue.json"
