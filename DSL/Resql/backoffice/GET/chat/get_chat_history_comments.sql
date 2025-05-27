/*
declaration:
  version: 0.1
  description: "Fetch the latest comment from chat history for a given chat ID"
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
      - field: id
        type: string
        description: "Unique identifier for the comment"
      - field: chat_id
        type: string
        description: "Identifier of the chat the comment belongs to"
      - field: comment
        type: string
        description: "Content of the comment"
      - field: created
        type: timestamp
        description: "Timestamp when the comment was created"
      - field: author_display_name
        type: string
        description: "Display name of the comment's author"
*/
SELECT
    id,
    chat_id,
    comment,
    created,
    author_display_name
FROM chat_history_comments
WHERE chat_id = :chatId
ORDER BY created DESC
LIMIT 1;
