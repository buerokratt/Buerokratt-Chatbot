/*
declaration:
  version: 0.1
  description: "Update end-user identity fields in the latest denormalized chat record"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Base ID of the chat to update"
      - field: endUserId
        type: string
        description: "New ID of the end user"
      - field: endUserFirstName
        type: string
        description: "First name of the end user"
      - field: endUserLastName
        type: string
        description: "Last name of the end user"
      - field: updated
        type: timestamp
        description: "Timestamp of the update"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the update was applied"
*/
-- Using array approach directly
SELECT copy_row_with_modifications(
    'denormalized_chat',                              -- Table name for denormalized_chat
    'id', '::UUID', id::VARCHAR,                   -- ID column handling
    ARRAY[                                            -- Direct array of modifications
        'chat_id', '', :chatId,
        'end_user_id', '', :endUserId,
        'end_user_first_name', '', :endUserFirstName,
        'end_user_last_name', '', :endUserLastName,
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
    ]::VARCHAR[]
)
FROM denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;