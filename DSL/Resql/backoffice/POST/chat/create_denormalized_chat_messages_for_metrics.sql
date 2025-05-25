INSERT INTO denormalized_chat_messages_for_metrics (
    chat_id,
    chat_base_id,
    message_id,
    message_base_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_rating,
    feedback_text,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    created,
    updated,
    ended,
    first_message_timestamp,
    last_message_timestamp,
    message_created,
    message_updated,
    message_event,
    message_author_role,
    message_author_id,
    message_forwarded_from_csa,
    message_forwarded_to_csa,
    external_id,
    received_from,
    timestamp
)
SELECT
    CASE WHEN (SELECT value) ->> 'chat_id' = 'null' THEN NULL ELSE ((SELECT value) ->> 'chat_id')::UUID END,
    (SELECT value) ->> 'chat_base_id',
    CASE WHEN (SELECT value) ->> 'message_id' = 'null' THEN NULL ELSE ((SELECT value) ->> 'message_id')::UUID END,
    CASE WHEN (SELECT value) ->> 'message_base_id' = 'null' THEN NULL ELSE (SELECT value) ->> 'message_base_id' END,
    CASE WHEN (SELECT value) ->> 'status' = 'null' THEN NULL ELSE (SELECT value) ->> 'status' END,
    CASE WHEN (SELECT value) ->> 'end_user_email' = 'null' THEN NULL ELSE (SELECT value) ->> 'end_user_email' END,
    CASE WHEN (SELECT value) ->> 'end_user_phone' = 'null' THEN NULL ELSE (SELECT value) ->> 'end_user_phone' END,
    CASE WHEN (SELECT value) ->> 'feedback_rating' = 'null' THEN NULL ELSE NULLIF((SELECT value) ->> 'feedback_rating', '')::INTEGER END,
    CASE WHEN (SELECT value) ->> 'feedback_text' = 'null' THEN NULL ELSE (SELECT value) ->> 'feedback_text' END,
    CASE WHEN (SELECT value) ->> 'customer_support_display_name' = 'null' THEN NULL ELSE (SELECT value) ->> 'customer_support_display_name' END,
    CASE WHEN (SELECT value) ->> 'customer_support_id' = 'null' THEN NULL ELSE (SELECT value) ->> 'customer_support_id' END,
    CASE WHEN (SELECT value) ->> 'customer_support_first_name' = 'null' THEN NULL ELSE (SELECT value) ->> 'customer_support_first_name' END,
    CASE WHEN (SELECT value) ->> 'customer_support_last_name' = 'null' THEN NULL ELSE (SELECT value) ->> 'customer_support_last_name' END,
    CASE 
        WHEN (SELECT value) ->> 'created' = 'CURRENT_TIMESTAMP' THEN NOW()
        ELSE COALESCE(((SELECT value) ->> 'created')::TIMESTAMP WITH TIME ZONE, NOW())
    END,
    CASE
        WHEN (SELECT value) ->> 'updated' = 'CURRENT_TIMESTAMP' THEN NOW()
        ELSE COALESCE(((SELECT value) ->> 'updated')::TIMESTAMP WITH TIME ZONE, NOW())
    END,
    CASE
        WHEN (SELECT value) ->> 'ended' = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN (SELECT value) ->> 'ended' = '' OR (SELECT value) ->> 'ended' = 'null' THEN NULL
        ELSE ((SELECT value) ->> 'ended')::TIMESTAMP WITH TIME ZONE
    END,
    CASE WHEN (SELECT value) ->> 'first_message_timestamp' = 'null' THEN NULL ELSE ((SELECT value) ->> 'first_message_timestamp')::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN (SELECT value) ->> 'last_message_timestamp' = 'null' THEN NULL ELSE ((SELECT value) ->> 'last_message_timestamp')::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN (SELECT value) ->> 'message_created' = 'null' THEN NULL ELSE ((SELECT value) ->> 'message_created')::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN (SELECT value) ->> 'message_updated' = 'null' THEN NULL ELSE ((SELECT value) ->> 'message_updated')::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN (SELECT value) ->> 'message_event' = 'null' THEN NULL ELSE (SELECT value) ->> 'message_event' END,
    CASE WHEN (SELECT value) ->> 'message_author_role' = 'null' THEN NULL ELSE (SELECT value) ->> 'message_author_role' END,
    CASE WHEN (SELECT value) ->> 'message_author_id' = 'null' THEN NULL ELSE (SELECT value) ->> 'message_author_id' END,
    CASE WHEN (SELECT value) ->> 'message_forwarded_from_csa' = 'null' THEN NULL ELSE (SELECT value) ->> 'message_forwarded_from_csa' END,
    CASE WHEN (SELECT value) ->> 'message_forwarded_to_csa' = 'null' THEN NULL ELSE (SELECT value) ->> 'message_forwarded_to_csa' END,
    CASE WHEN (SELECT value) ->> 'external_id' = 'null' THEN NULL ELSE (SELECT value) ->> 'external_id' END,
    CASE WHEN (SELECT value) ->> 'received_from' = 'null' THEN NULL ELSE (SELECT value) ->> 'received_from' END,
    CASE
        WHEN (SELECT value) ->> 'timestamp' = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN (SELECT value) ->> 'timestamp' = 'null' THEN NOW()
        ELSE COALESCE(((SELECT value) ->> 'timestamp')::TIMESTAMP WITH TIME ZONE, NOW())
    END
FROM JSON_ARRAY_ELEMENTS(ARRAY_TO_JSON(ARRAY[:records])) WITH ORDINALITY;