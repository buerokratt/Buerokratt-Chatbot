/*
declaration:
  version: 0.1
  description: "Update the feedback text in the latest denormalized chat record"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Base ID of the chat to update"
      - field: feedbackText
        type: string
        description: "Updated feedback comment for the chat"
      - field: updated
        type: timestamp
        description: "Timestamp of the update"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the feedback text update was applied"
*/
-- Using array approach directly
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        -- Table name for denormalized_chat
        'chat.denormalized_chat',
        'id', '::UUID', id::VARCHAR,                   -- ID column handling
        -- Direct array of modifications
        ARRAY[
            'chat_id', '', :chatId,
            'feedback_text', '', :feedbackText,
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
FROM chat.denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;
