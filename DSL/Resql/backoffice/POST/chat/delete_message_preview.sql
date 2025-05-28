/*
declaration:
  version: 0.1
  description: "Clear the message preview content for a given chat"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Unique identifier of the chat"
*/
INSERT INTO chat.message_preview (chat_base_id, content)
VALUES (:chatId, NULL);
