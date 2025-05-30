/*
declaration:
  version: 0.1
  description: "Fetch the latest message preview for a given chat"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: chatId
        type: string
        description: "Unique identifier for the chat"
  response:
    fields:
      - field: preview
        type: string
        description: "Content of the latest message preview"
*/
SELECT content AS preview
FROM chat.message_preview
WHERE chat_base_id = :chatId
ORDER BY created DESC
LIMIT 1;
