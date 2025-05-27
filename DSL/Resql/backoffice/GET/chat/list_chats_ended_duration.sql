/*
declaration:
  version: 0.1
  description: "Calculate the total chat duration (in seconds) for non-bot chats ended within the last month"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: bot_institution_id
        type: string
        description: "Identifier of the bot institution to exclude from the calculation"
  response:
    fields:
      - field: duration_in_seconds
        type: integer
        description: "Sum of chat durations in seconds for the specified time window"
*/
SELECT
    SUM(chat_duration_in_seconds) AS duration_in_seconds
FROM (
    SELECT DISTINCT ON (chat_id)
        chat_id,
        chat_duration_in_seconds,
        ended,
        customer_support_id
    FROM denormalized_chat
    ORDER BY chat_id, denormalized_record_created DESC
) latest_chats
WHERE
    ended IS NOT NULL
    AND ended > (NOW() - '1 month'::INTERVAL)
    AND customer_support_id <> ''
    AND customer_support_id <> :bot_institution_id;