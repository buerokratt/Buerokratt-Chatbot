/*
declaration:
  version: 0.1
  description: "Update the end-user contact details in the most recent chat record"
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
            'end_user_email', '', :endUserEmail,
            'end_user_phone', '', :endUserPhone,
            'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )) AS id,
    NOW()::TEXT AS updated
FROM chat
WHERE base_id = :chatId
ORDER BY id DESC
LIMIT 1;
