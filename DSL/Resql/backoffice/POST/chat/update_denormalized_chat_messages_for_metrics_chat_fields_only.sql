/*
declaration:
  version: 0.1
  description: "Insert a denormalized chat message into metrics table with optional chat/message fields, reusing latest row as fallback"
  method: post
  namespace: chat
  allowlist:
    body:
      - field: chatBaseId
        type: string
        description: "Chat base ID; if null, fallback to previous row value"
      - field: chatId
        type: string
        description: "Chat UUID; if null, fallback to previous row value"
      - field: status
        type: string
        description: "Chat status; if null, fallback to previous row value"
      - field: endUserEmail
        type: string
        description: "End user email; optional"
      - field: endUserPhone
        type: string
        description: "End user phone; optional"
      - field: feedbackText
        type: string
        description: "Feedback text; optional"
      - field: feedbackRating
        type: string
        description: "Feedback rating; optional"
      - field: customerSupportDisplayName
        type: string
        description: "CSA display name; optional"
      - field: customerSupportId
        type: string
        description: "CSA ID; used for matching fallback values"
      - field: customerSupportFirstName
        type: string
        description: "CSA first name; optional"
      - field: customerSupportLastName
        type: string
        description: "CSA last name; optional"
      - field: externalId
        type: string
        description: "External chat ID; optional"
      - field: receivedFrom
        type: string
        description: "Source of the chat; optional"
      - field: updated
        type: string
        description: "Updated timestamp; CURRENT_TIMESTAMP, null, or specific timestamp"
      - field: ended
        type: string
        description: "Ended timestamp; CURRENT_TIMESTAMP, null, or specific timestamp"
  response:
    fields: []
*/
INSERT INTO chat.denormalized_chat_messages_for_metrics (
    chat_base_id,
    chat_id,
    message_id,
    message_base_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_text,
    feedback_rating,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    external_id,
    received_from,
    created,
    updated,
    ended,
    message_created,
    message_updated,
    message_event,
    message_author_role,
    message_author_id,
    message_forwarded_from_csa,
    message_forwarded_to_csa,
    first_message_timestamp,
    last_message_timestamp,
    timestamp
)
SELECT
    CASE
        WHEN :chatBaseId::TEXT = 'null' THEN chat_base_id
        ELSE :chatBaseId
    END,
    CASE
        WHEN :chatId::TEXT = 'null' THEN chat_id
        ELSE :chatId::UUID
    END,
    message_id,
    message_base_id,
    CASE
        WHEN :status::TEXT = 'null' THEN chat_status
        ELSE :status::VARCHAR
    END,
    CASE
        WHEN :endUserEmail::TEXT = 'null' THEN end_user_email
        ELSE :endUserEmail::VARCHAR
    END,
    CASE
        WHEN :endUserPhone::TEXT = 'null' THEN end_user_phone
        ELSE :endUserPhone::VARCHAR
    END,
    CASE
        WHEN :feedbackText::TEXT = 'null' THEN feedback_text
        ELSE :feedbackText::VARCHAR
    END,
    CASE
        WHEN :feedbackRating::TEXT = 'null' THEN feedback_rating
        ELSE NULLIF(:feedbackRating::TEXT, '')::INTEGER
    END,
    CASE
        WHEN
            :customerSupportDisplayName::TEXT = 'null'
            AND :customerSupportId::TEXT = customer_support_id::TEXT
            THEN customer_support_display_name
        WHEN :customerSupportDisplayName::TEXT = 'null'
            THEN NULL
        ELSE :customerSupportDisplayName::VARCHAR
    END,
    CASE
        WHEN :customerSupportId::TEXT = 'null' THEN customer_support_id
        ELSE :customerSupportId::VARCHAR
    END,
    CASE
        WHEN
            :customerSupportFirstName::TEXT = 'null'
            AND :customerSupportId::TEXT = customer_support_id::TEXT
            THEN customer_support_first_name
        WHEN :customerSupportFirstName::TEXT = 'null'
            THEN NULL
        ELSE :customerSupportFirstName::VARCHAR
    END,
    CASE
        WHEN
            :customerSupportLastName::TEXT = 'null'
            AND :customerSupportId::TEXT = customer_support_id::TEXT
            THEN customer_support_last_name
        WHEN :customerSupportLastName::TEXT = 'null'
            THEN NULL
        ELSE :customerSupportLastName::VARCHAR
    END,
    CASE
        WHEN :externalId::TEXT = 'null' THEN external_id
        ELSE :externalId::VARCHAR
    END,
    CASE
        WHEN :receivedFrom::TEXT = 'null' THEN received_from
        ELSE :receivedFrom::VARCHAR
    END,
    created,
    CASE
        WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :updated::TEXT = '' THEN NULL
        WHEN :updated::TEXT = 'null' THEN updated
        ELSE :updated::TIMESTAMP WITH TIME ZONE
    END,
    CASE
        WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :ended::TEXT = '' THEN NULL
        WHEN :ended::TEXT = 'null' THEN ended
        ELSE :ended::TIMESTAMP WITH TIME ZONE
    END,
    message_created,
    message_updated,
    message_event,
    message_author_role,
    message_author_id,
    message_forwarded_from_csa,
    message_forwarded_to_csa,
    first_message_timestamp,
    last_message_timestamp,
    CASE
        WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :updated::TEXT = '' THEN NULL
        WHEN :updated::TEXT = 'null' THEN timestamp
        ELSE :updated::TIMESTAMP WITH TIME ZONE
    END
FROM chat.denormalized_chat_messages_for_metrics
WHERE chat_base_id = :chatBaseId
ORDER BY timestamp DESC
LIMIT 1;
