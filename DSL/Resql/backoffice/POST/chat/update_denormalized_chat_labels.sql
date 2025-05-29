/*
declaration:
  version: 0.1
  description: "Update labels in the latest denormalized chat record"
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
      - field: updated
        type: timestamp
        description: "Timestamp of the update"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the label update was applied"
*/
-- Using array approach directly
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        -- Table name for denormalized_chat
        'denormalized_chat',
        'id', '::UUID', id::VARCHAR,                   -- ID column handling
        -- Direct array of modifications
        ARRAY[
            'chat_id', '', :chatId,
            'labels', '::VARCHAR[]', (ARRAY[:labels])::VARCHAR,
            'updated', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END,
            'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END
        ]::VARCHAR []
    )
FROM denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;
