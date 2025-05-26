/*
declaration:
  version: 0.1
  description: "Update the feedback text of the most recent chat version"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: id
        type: string
        description: "Base ID of the chat to update"
      - field: feedbackText
        type: string
        description: "Feedback comment or text provided by the user"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp when the chat feedback text was updated"
*/
SELECT copy_row_with_modifications(
    'chat',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'feedback_text', '', :feedbackText,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
), NOW()::TEXT as updated FROM chat
WHERE base_id = :id
ORDER BY updated DESC
LIMIT 1;
