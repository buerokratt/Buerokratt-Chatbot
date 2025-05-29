/*
declaration:
  version: 0.1
  description: "Update the feedback rating of the most recent chat version"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: id
        type: string
        description: "Base ID of the chat to update"
      - field: feedback_rating
        type: integer
        description: "New feedback rating to assign to the chat"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp when the chat feedback rating was updated"
*/
SELECT
    (COPY_ROW_WITH_MODIFICATIONS(
        'chat',
        'id', '::UUID', id::VARCHAR,
        ARRAY[
            'feedback_rating', '::INTEGER', :feedback_rating::VARCHAR,
            'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )) AS id,
    NOW()::TEXT AS updated
FROM chat
WHERE base_id = :id
ORDER BY updated DESC
LIMIT 1;
