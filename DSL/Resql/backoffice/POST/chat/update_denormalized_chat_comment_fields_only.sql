/*
declaration:
  version: 0.1
  description: "Add or update a comment and metadata in the latest denormalized chat record"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Base ID of the chat to update"
      - field: comment
        type: string
        description: "Comment text to attach to the chat"
      - field: commentAuthor
        type: string
        description: "Name of the person adding the comment"
      - field: commentAddedDate
        type: timestamp
        description: "Timestamp when the comment was added"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the comment update was applied"
*/
-- Using array approach directly
SELECT copy_row_with_modifications(
    'denormalized_chat',                              -- Table name for denormalized_chat
    'id', '::UUID', id::VARCHAR,                   -- ID column handling
    ARRAY[                                            -- Direct array of modifications
        'chat_id', '', :chatId,
        'comment', '', :comment,
        'comment_author', '', :commentAuthor,
        'comment_added_date', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :commentAddedDate::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :commentAddedDate::TEXT = '' THEN NULL
                WHEN :commentAddedDate::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :commentAddedDate::VARCHAR
            END,
        'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :commentAddedDate::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :commentAddedDate::TEXT = '' THEN NULL
                WHEN :commentAddedDate::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :commentAddedDate::VARCHAR
            END
    ]::VARCHAR[]
)
FROM denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;