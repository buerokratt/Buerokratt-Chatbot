/*
declaration:
  version: 0.1
  description: "Update labels for the most recent chat record by base ID"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Base ID of the chat to update"
      - field: labels
        type: array
        items:
          type: string
        description: "List of labels to assign to the chat"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp when the chat record was updated"
*/
SELECT
    (COPY_ROW_WITH_MODIFICATIONS(
        'chat',
        'id', '::UUID', id::VARCHAR,
        ARRAY[
            'labels', '::VARCHAR[]', (ARRAY[:labels])::VARCHAR,
            'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )) AS id,
    NOW()::TEXT AS updated
FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
