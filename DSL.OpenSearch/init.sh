#clear
curl -XDELETE 'http://localhost:9200/*' -u admin:admin --insecure

#SSE events
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/sse-events" -ku admin:admin --data-binary "@fieldMappings/sse-events.json"
curl -H "Content-Type: application/x-ndjson" -X PUT "http://localhost:9200/sse-events/_bulk" -ku admin:admin --data-binary "@mock/sse-events.json"
curl -L -X POST 'http://localhost:9200/_scripts/sse-events-by-type' -H 'Content-Type: application/json' -H 'Cookie: customJwtCookie=test' --data-binary "@templates/sse-events-by-type.json"
