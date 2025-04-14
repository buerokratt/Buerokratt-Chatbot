WITH latest_chat_versions AS (
    -- First get the latest version of each chat
    SELECT DISTINCT ON (chat_id) *
    FROM denormalized_chat
    ORDER BY chat_id, denormalized_record_created DESC
)

SELECT
    chat_id AS id,
    customer_support_id,
    customer_support_display_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    status,
    created,
    updated,
    ended,
    end_user_email,
    end_user_phone,
    end_user_os,
    end_user_url,
    external_id,
    forwarded_to,
    forwarded_to_name,
    received_from,
    received_from_name,
    customer_messages_count AS customer_messages,
    (
        SELECT last_message
        FROM denormalized_chat
        WHERE chat_id = latest_chat_versions.chat_id
        AND last_message_event_with_content <> 'rating'
        AND last_message_event_with_content <> 'requested-chat-forward'
        AND last_message <> ''
        AND last_message <> 'message-read'
        ORDER BY id DESC
        LIMIT 1
    ) AS last_message,
    contacts_message,
    (
        SELECT last_message_timestamp
        FROM denormalized_chat
        WHERE chat_id = latest_chat_versions.chat_id
        AND last_message_event <> 'rating'
        AND last_message_event <> 'requested-chat-forward'
        ORDER BY id DESC
        LIMIT 1
    ) AS last_message_timestamp,
    last_message_event_with_content,
    csa_title
    
FROM latest_chat_versions
WHERE 
    ended IS NULL 
    AND is_bot = FALSE
    AND status <> 'VALIDATING'
ORDER BY created ASC
LIMIT :limit;
