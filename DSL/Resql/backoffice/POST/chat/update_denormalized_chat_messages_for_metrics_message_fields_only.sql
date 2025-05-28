INSERT INTO denormalized_chat_messages_for_metrics (
    chat_base_id,
    chat_id,
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
    first_message_timestamp,
    last_message_timestamp,
    message_id,
    message_base_id,
    message_created,
    message_updated,
    message_event,
    message_author_role,
    message_author_id,
    message_forwarded_from_csa,
    message_forwarded_to_csa,
    timestamp
)
SELECT 
    chat_base_id,
    chat_id,
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
    CASE
        WHEN :content::TEXT <> '' AND first_message_timestamp IS NULL THEN
            CASE
                WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
                WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()
                ELSE :lastMessageTimestamp::TIMESTAMP WITH TIME ZONE
            END
        ELSE first_message_timestamp
    END,
    CASE
        WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
        WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()
        ELSE :lastMessageTimestamp::TIMESTAMP WITH TIME ZONE
    END,
    :messageId::UUID,
    :messageBaseId,
    CASE
        WHEN :messageCreated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :messageCreated::TEXT = '' THEN NULL
        WHEN :messageCreated::TEXT = 'null' THEN NOW()
        ELSE :messageCreated::TIMESTAMP WITH TIME ZONE
    END,
    CASE
        WHEN :messageUpdated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :messageUpdated::TEXT = '' THEN NULL
        WHEN :messageUpdated::TEXT = 'null' THEN NOW()
        ELSE :messageUpdated::TIMESTAMP WITH TIME ZONE
    END,
    LOWER(:messageEvent)::event_type,
    :messageAuthorRole::author_role_type,
    :messageAuthorId::VARCHAR,
    :messageForwardedFromCsa::VARCHAR,
    :messageForwardedToCsa::VARCHAR,
    CASE
        WHEN :timestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :timestamp::TEXT = '' THEN NULL
        WHEN :timestamp::TEXT = 'null' THEN NOW()
        ELSE :timestamp::TIMESTAMP WITH TIME ZONE
    END
FROM denormalized_chat_messages_for_metrics
WHERE chat_base_id = :chatBaseId
ORDER BY timestamp DESC
LIMIT 1;