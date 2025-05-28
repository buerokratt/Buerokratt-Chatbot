/*
declaration:
  version: 0.1
  description: "Insert a message preview into the chat"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Unique identifier of the chat"
      - field: content
        type: string
        description: "Preview text content of the message"
*/
INSERT INTO chat.message_preview (chat_base_id, content)
VALUES (:chatId, :content);
