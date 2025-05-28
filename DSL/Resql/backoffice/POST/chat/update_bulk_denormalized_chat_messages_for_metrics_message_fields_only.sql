INSERT INTO chat.denormalized_chat_messages_for_metrics (
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
    base_record.chat_base_id,
    base_record.chat_id,
    base_record.chat_status,
    base_record.end_user_email,
    base_record.end_user_phone,
    base_record.feedback_text,
    base_record.feedback_rating,
    base_record.customer_support_display_name,
    base_record.customer_support_id,
    base_record.customer_support_first_name,
    base_record.customer_support_last_name,
    base_record.external_id,
    base_record.received_from,
    base_record.created,
    base_record.updated,
    base_record.ended,
    CASE
        WHEN base_record.first_message_timestamp IS NULL THEN msg_data.message_updated
        ELSE base_record.first_message_timestamp
    END,
    msg_data.message_updated,
    msg_data.message_id::UUID,
    msg_data.message_base_id,
    msg_data.message_updated,
    msg_data.message_updated,
    LOWER(:messageEvent)::event_type,
    :messageAuthorRole::author_role_type,
    :messageAuthorId::VARCHAR,
    :messageForwardedFromCsa::VARCHAR,
    :messageForwardedToCsa::VARCHAR,
    msg_data.message_updated
FROM (
    SELECT * FROM chat.denormalized_chat_messages_for_metrics
    WHERE chat_base_id = :chatBaseId
    ORDER BY timestamp DESC
    LIMIT 1
) base_record
CROSS JOIN (
    SELECT 
        (SELECT value) ->> 'id' as message_id,
        (SELECT value) ->> 'baseId' as message_base_id,
        ((SELECT value) ->> 'updated')::TIMESTAMP WITH TIME ZONE as message_updated
    FROM JSON_ARRAY_ELEMENTS(ARRAY_TO_JSON(ARRAY[:messages])) WITH ORDINALITY
) msg_data;