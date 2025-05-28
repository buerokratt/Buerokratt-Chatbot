/*
declaration:
  version: 0.1
  description: "Add a comment to the chat history"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Unique identifier of the chat"
      - field: comment
        type: string
        description: "Text content of the comment"
      - field: authorDisplayName
        type: string
        description: "Display name of the comment's author"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the new comment"
      - field: chat_id
        type: string
        description: "Identifier of the chat to which the comment belongs"
      - field: comment
        type: string
        description: "Text content of the added comment"
      - field: created
        type: timestamp
        description: "Timestamp when the comment was created"
      - field: author_display_name
        type: string
        description: "Display name of the comment's author"
*/
INSERT INTO chat.chat_history_comments (chat_id, comment, author_display_name)
VALUES (:chatId, :comment, :authorDisplayName)
RETURNING id, chat_id, comment, created, author_display_name;
