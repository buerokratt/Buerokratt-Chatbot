WITH
    title_visibility AS (
        SELECT value
        FROM configuration
        WHERE key = 'is_csa_title_visible' AND NOT deleted
        ORDER BY id DESC
        LIMIT 1
    ),

    message_with_content_and_not_rating_or_forward AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE
            event <> 'rating'
            AND event <> 'requested-chat-forward'
            AND content <> ''
            AND content <> 'message-read'
        GROUP BY chat_base_id
    ),

    last_content_message AS (
        SELECT
            content,
            chat_base_id
        FROM message
            INNER JOIN message_with_content_and_not_rating_or_forward ON id = max_id
    ),

    message_not_rating_or_forward AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE
            event <> 'rating'
            AND event <> 'requested-chat-forward'
        GROUP BY chat_base_id
    ),

    last_messages_time AS (
        SELECT
            updated,
            chat_base_id
        FROM message
            INNER JOIN message_not_rating_or_forward ON id = max_id
    ),

    max_chats AS (
        SELECT MAX(id) AS max_id
        FROM chat
        GROUP BY base_id
    ),

    idle_chats AS (
        SELECT
            base_id,
            customer_support_id,
            customer_support_display_name,
            csa_title,
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
            received_from_name
        FROM chat
            INNER JOIN max_chats ON id = max_id
        WHERE status = 'IDLE'
    ),

    messages_with_event AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE event <> ''
        GROUP BY chat_base_id
    ),

    last_message_event AS (
        SELECT
            event,
            chat_base_id
        FROM message
            INNER JOIN messages_with_event ON id = max_id
    ),

    fulfilled_message AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE event = 'contact-information-fulfilled'
        GROUP BY chat_base_id
    ),

    contact_message AS (
        SELECT
            content,
            chat_base_id
        FROM message
            INNER JOIN fulfilled_message ON id = max_id
    )

SELECT
    c.base_id AS id,
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
    last_content_message.content AS last_message,
    contact_message.content AS contacts_message,
    m.updated AS last_message_timestamp,
    last_message_event.event AS last_message_event,
    (
        CASE WHEN title_visibility.value = 'true' THEN c.csa_title ELSE '' END
    ) AS csa_title
FROM idle_chats AS c
    LEFT JOIN last_messages_time AS m ON c.base_id = m.chat_base_id
    LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
    LEFT JOIN last_message_event ON c.base_id = last_message_event.chat_base_id
    LEFT JOIN contact_message ON c.base_id = contact_message.chat_base_id
    CROSS JOIN title_visibility
ORDER BY created ASC LIMIT :limit;
