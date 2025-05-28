/*
declaration:
  version: 0.1
  description: "Count the number of chats ended within a specified date range"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: start
        type: date
        description: "Start date for the range (inclusive)"
      - field: end
        type: date
        description: "End date for the range (inclusive)"
  response:
    fields:
      - field: total_count
        type: integer
        description: "Total number of chats that ended in the specified date range"
*/
WITH
    max_chats AS (
        SELECT COUNT(*) AS total_count
        FROM chat.chat
        WHERE
            ended IS NOT NULL
            AND status = 'ENDED'
            AND created::DATE BETWEEN :start::date AND :end::date
    )

SELECT total_count
FROM max_chats;
