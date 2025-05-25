/*
declaration:
  version: 0.1
  description: "Fetch base IDs of anonymous chats that ended before a specified timestamp"
  method: get
  namespace: chat
  allowlist:
    query:
      - field: fromDate
        type: timestamp
        description: "Upper bound timestamp; only chats ended before this time are returned"
  response:
    fields:
      - field: base_id
        type: string
        description: "Unique base identifier of the chat"
*/
SELECT base_id
FROM chat
WHERE
    ended IS NOT NULL
    AND status = 'ENDED'
    AND end_user_id = ''
    AND ended < :fromDate::TIMESTAMP WITH TIME ZONE;
