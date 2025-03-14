WITH
    bot_name AS (
        SELECT value
        FROM configuration
        WHERE NOT deleted AND key = 'bot_institution_id'
        ORDER BY id DESC
        LIMIT 1
    ),

    title_visibility AS (
        SELECT value
        FROM configuration
        WHERE NOT deleted AND key = 'is_csa_title_visible'
        ORDER BY id DESC
        LIMIT 1
    ),

    max_chats AS (
        SELECT MAX(id) AS max_id
        FROM chat
        GROUP BY base_id
    ),

    fulfilled_messages AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE event = 'contact-information-fulfilled'
        GROUP BY chat_base_id
    ),

    message_with_content AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE content <> ''
        GROUP BY chat_base_id
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

    messagae_not_rating_or_forward_events AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE
            event <> 'rating'
            AND event <> 'requested-chat-forward'
        GROUP BY chat_base_id
    ),

    active_chats AS (
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
            CROSS JOIN bot_name
            INNER JOIN max_chats ON
                id = max_id
                AND ended IS NULL
                AND customer_support_id <> bot_name.value
                AND status <> 'VALIDATING'
    ),

    contacts_message AS (
        SELECT
            chat_base_id,
            content
        FROM message
            INNER JOIN fulfilled_messages ON id = max_id
    ),

    last_event_message AS (
        SELECT
            event,
            chat_base_id
        FROM message
            INNER JOIN message_with_content ON id = max_id
    ),

    last_content_message AS (
        SELECT
            content,
            chat_base_id
        FROM message
            INNER JOIN message_with_content_and_not_rating_or_forward ON id = max_id
    ),

    messages_update_time AS (
        SELECT
            updated,
            chat_base_id
        FROM message
            INNER JOIN messagae_not_rating_or_forward_events ON id = max_id
    ),

    customer_messages AS (
        SELECT
            message.chat_base_id,
            COUNT(message.id) AS messages_count
        FROM message
        WHERE
            message.author_role = 'end-user'
            AND (message.event = '' OR message.event IS NULL)
        GROUP BY message.chat_base_id
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
    customer_messages.messages_count AS customer_messages,
    last_content_message.content AS last_message,
    contacts_message.content AS contacts_message,
    messages_update_time.updated AS last_message_timestamp,
    last_event_message.event AS last_message_event,
    (
        CASE WHEN title_visibility.value = 'true' THEN c.csa_title ELSE '' END
    ) AS csa_title
FROM active_chats AS c
    LEFT JOIN messages_update_time ON c.base_id = messages_update_time.chat_base_id
    LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
    LEFT JOIN last_event_message ON c.base_id = last_event_message.chat_base_id
    LEFT JOIN contacts_message ON c.base_id = contacts_message.chat_base_id
    LEFT JOIN customer_messages ON c.base_id = customer_messages.chat_base_id
    CROSS JOIN title_visibility
ORDER BY created ASC LIMIT :limit;
