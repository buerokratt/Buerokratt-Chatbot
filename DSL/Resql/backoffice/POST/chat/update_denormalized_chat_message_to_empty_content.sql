/*
declaration:
  version: 0.1
  description: "Clear specific message-related fields in the latest denormalized chat records for given chats"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chats
        type: array
        items:
          type: string
        description: "List of chat IDs to update"
      - field: updated
        type: timestamp
        description: "Timestamp to assign to the denormalized record creation field"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when message-related fields were cleared"
*/

-- Using array approach directly
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        -- Table name for denormalized_chat
        'chat.denormalized_chat',
        'id', '::UUID', id::VARCHAR,                   -- ID column handling
        -- Direct array of modifications
        ARRAY[
            'last_message_including_empty_content', '', '',
            'last_message_event_with_content', '::event_type', NULL,
            'contacts_message', '',
            CASE
                WHEN contacts_message IS NOT NULL THEN ''
                ELSE contacts_message
            END,
            'last_message_with_content_and_not_rating_or_forward', '', NULL,
            'last_message', '', NULL,
            'first_message', '', NULL,
            'first_message_timestamp', '::TIMESTAMP WITH TIME ZONE', NULL,
            'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END,
            'all_messages', '::TEXT[]', '{}'
        ]::VARCHAR []
    )
FROM chat.denormalized_chat
WHERE chat_id IN (:chats) AND denormalized_record_created = (
    SELECT MAX(denormalized_record_created)
    FROM chat.denormalized_chat AS dc_inner
    WHERE dc_inner.chat_id = dc.chat_id
);
