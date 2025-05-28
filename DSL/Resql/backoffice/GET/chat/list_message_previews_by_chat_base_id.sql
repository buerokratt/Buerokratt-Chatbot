/*
declaration:
  version: 0.1
  description: "Fetch the latest message preview content for a given chat"
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
      - field: content
        type: string
        description: "Content of the most recent message preview"
      - field: chat_base_id
        type: string
        description: "Base identifier of the chat associated with the preview"
*/
SELECT DISTINCT ON (chat_base_id) content, chat_base_id
  FROM chat.message_preview
  Where chat_base_id = :chatId
  ORDER BY chat_base_id, created DESC;