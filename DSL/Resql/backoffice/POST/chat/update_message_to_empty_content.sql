/*
declaration:
  version: 0.1
  description: "Clear CSA assignment fields in the latest active denormalized chat record"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Chat ID whose latest record's CSA fields should be cleared"
      - field: updated
        type: timestamp
        description: "Timestamp to apply to the updated and denormalized_record_created fields"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the CSA fields were cleared"
*/
SELECT
    NOW()::TEXT AS updated,
    COPY_ROW_WITH_MODIFICATIONS(
        'chat.message',
        'id', '::UUID', id::VARCHAR,
        ARRAY[
            'content', '', '',
            'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )
FROM chat.message AS m_1
WHERE
    chat_base_id IN (:chats) AND updated = (
        SELECT MAX(updated) FROM chat.message AS m_2
        WHERE m_1.chat_base_id = m_2.chat_base_id AND m_1.base_id = m_2.base_id
    );
