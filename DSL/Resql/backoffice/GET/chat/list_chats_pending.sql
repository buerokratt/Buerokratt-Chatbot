-- Idle chats query using subqueries instead of joins
WITH latest_idle_chats AS (
    SELECT DISTINCT ON (chat_id)
        chat_id,
        customer_support_id,
        customer_support_display_name,
        end_user_id,
        end_user_first_name,
        end_user_last_name,
        end_user_email,
        end_user_phone,
        end_user_os,
        end_user_url,
        status,
        created,
        updated,
        ended,
        forwarded_to,
        forwarded_to_name,
        received_from,
        received_from_name,
        external_id,
        csa_title,
        contacts_message
    FROM denormalized_chat
    ORDER BY chat_id, id DESC
)

SELECT
    c.chat_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    c.end_user_id,
    c.end_user_first_name,
    c.end_user_last_name,
    c.status,
    c.created,
    c.updated,
    c.ended,
    c.end_user_email,
    c.end_user_phone,
    c.end_user_os,
    c.end_user_url,
    c.external_id,
    c.forwarded_to,
    c.forwarded_to_name,
    c.received_from,
    c.received_from_name,
    (
        SELECT last_message
        FROM denormalized_chat
        WHERE chat_id = c.chat_id
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
        WHERE chat_id = c.chat_id
        AND last_message_event <> 'rating'
        AND last_message_event <> 'requested-chat-forward'
        ORDER BY id DESC
        LIMIT 1
    ) AS last_message_timestamp,
    (
        SELECT last_message_event
        FROM denormalized_chat
        WHERE chat_id = c.chat_id
        AND last_message_event <> ''
        ORDER BY id DESC
        LIMIT 1
    ) AS last_message_event,
    csa_title
FROM latest_idle_chats AS c
WHERE status = 'IDLE'
ORDER BY c.created ASC
LIMIT :limit::INTEGER;
