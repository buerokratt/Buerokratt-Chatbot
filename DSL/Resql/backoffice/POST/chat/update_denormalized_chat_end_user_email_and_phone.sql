/*
declaration:
  version: 0.1
  description: "Update end-user contact information in the latest denormalized chat record"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Base ID of the chat to update"
      - field: endUserEmail
        type: string
        description: "New email address of the end user"
      - field: endUserPhone
        type: string
        description: "New phone number of the end user"
      - field: updated
        type: timestamp
        description: "Timestamp of the update"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the update was applied"
*/
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        -- Table name for denormalized_chat
        'chat.denormalized_chat',
        'id', '::UUID', id::VARCHAR,                   -- ID column handling
        -- Direct array of modifications
        ARRAY[
            'chat_id', '', :chatId,
            'end_user_email', '', :endUserEmail,
            'end_user_phone', '', :endUserPhone,
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
