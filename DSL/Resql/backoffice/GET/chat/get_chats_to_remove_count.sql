/*
declaration:
  version: 0.1
  description: "Count the number of ended chats with valid messages, using different date thresholds for authenticated and anonymous users"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: auth_date
        type: date
        description: "Date threshold for authenticated users (inclusive)"
      - field: anon_date
        type: date
        description: "Date threshold for anonymous users (inclusive)"
  response:
    fields:
      - field: total_count
        type: integer
        description: "Total number of ended chats with at least one non-empty message"
*/
SELECT COUNT(*) AS total_count
FROM (
    SELECT DISTINCT ON (chat_id) *
    FROM denormalized_chat
    ORDER BY chat_id ASC, denormalized_record_created DESC
) AS latest_chats
WHERE
    latest_chats.ended IS NOT NULL
    AND latest_chats.status = 'ENDED'
    AND (
        (
            latest_chats.end_user_id IS NOT NULL
            AND latest_chats.end_user_id <> ''
            AND latest_chats.ended::DATE <= :auth_date::DATE
        )
        OR
        (
            latest_chats.end_user_id IS NULL
            OR latest_chats.end_user_id = ''
            AND latest_chats.ended::DATE <= :anon_date::DATE
        )
    )
    AND (
        latest_chats.all_messages IS NOT NULL
        AND ARRAY_LENGTH(latest_chats.all_messages, 1) > 0
        AND EXISTS (
            SELECT 1
            FROM UNNEST(latest_chats.all_messages) AS message_content
            WHERE message_content IS NOT NULL AND message_content <> ''
        )
    );
