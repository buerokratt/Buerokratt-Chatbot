/*
declaration:
  version: 0.1
  description: "Update end-user identity details in the latest chat version"
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
        description: "New identifier of the end user"
      - field: endUserFirstName
        type: string
        description: "New first name of the end user"
      - field: endUserLastName
        type: string
        description: "New last name of the end user"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp when the chat record was updated"
*/

SELECT
    (COPY_ROW_WITH_MODIFICATIONS(
        'chat.chat',
        'id', '::UUID', id::VARCHAR,
        ARRAY[
            'end_user_id', '', :endUserId,
            'end_user_first_name', '', :endUserFirstName,
            'end_user_last_name', '', :endUserLastName,
            'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )) AS id,
    NOW()::TEXT AS updated
FROM chat
WHERE base_id = :chatId
ORDER BY updated DESC
LIMIT 1;
