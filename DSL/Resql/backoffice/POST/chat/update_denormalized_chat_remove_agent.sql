/*
declaration:
  version: 0.1
  description: "Clear CSA assignment fields in the latest active denormalized chat record"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Chat ID whose latest record's CSA fields should be cleared"
      - field: updated
        type: timestamp
        description: "Timestamp to apply to the updated and denormalized_record_created fields"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the CSA fields were cleared"
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
            'customer_support_id', '', '',
            'customer_support_display_name', '', '',
            'customer_support_first_name', '', '',
            'customer_support_last_name', '', '',
            'csa_title', '', '',
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
WHERE
    denormalized_record_created = (
        SELECT MAX(denormalized_record_created)
        FROM chat.denormalized_chat
        WHERE chat_id = :chatId
    )
    AND chat_id = :chatId
    AND ended IS NULL;
