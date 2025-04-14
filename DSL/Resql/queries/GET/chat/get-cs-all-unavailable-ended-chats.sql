WITH
    title_visibility AS (
        SELECT value
        FROM configuration
        WHERE NOT deleted AND key = 'is_csa_title_visible'
        ORDER BY id DESC
        LIMIT 1
    ),

    fulfilled_messages AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE event = 'contact-information-fulfilled'
        GROUP BY chat_base_id
    ),

    contacts_message AS (
        SELECT
            chat_base_id,
            content
        FROM message
            INNER JOIN fulfilled_messages ON id = max_id
    ),

    max_chats AS (
        SELECT MAX(id) AS max_id
        FROM chat
        GROUP BY base_id
    ),

    unavailable_ended_chats AS (
        SELECT
            base_id,
            customer_support_id,
            customer_support_display_name,
            csa_title,
            end_user_id,
            end_user_first_name,
            end_user_last_name,
            end_user_email,
            end_user_phone,
            end_user_os,
            end_user_url,
            status,
            updated,
            ended,
            forwarded_to_name,
            received_from,
            labels,
            created
        FROM chat
            INNER JOIN max_chats ON
                id = max_id
                AND ended IS NOT null
    ),

    max_messages AS (
        SELECT MAX(id) AS max_id
        FROM message
        GROUP BY chat_base_id
    ),

    messages_update_time AS (
        SELECT
            updated,
            chat_base_id,
            LOWER(event) AS event_lowercase,
            (
                CASE
                    WHEN event = '' THEN null
                    ELSE LOWER(event)
                END
            ) AS last_message_event
        FROM message
            INNER JOIN max_messages ON id = max_id
    ),

    message_with_content AS (
        SELECT
            MAX(id) AS max_id,
            MIN(id) AS min_id
        FROM message
        WHERE
            content <> ''
            AND content <> 'message-read'
        GROUP BY chat_base_id
    ),

    first_content_message AS (
        SELECT
            created,
            chat_base_id
        FROM message
            INNER JOIN message_with_content ON message.id = message_with_content.min_id
    ),

    last_content_message AS (
        SELECT
            content,
            chat_base_id
        FROM message
            INNER JOIN message_with_content ON message.id = message_with_content.max_id
    ),

    max_chat_history_comments AS (
        SELECT MAX(id) AS max_id
        FROM chat_history_comments
        GROUP BY chat_id
    ),

    chat_history_comments AS (
        SELECT
            comment,
            chat_id
        FROM chat_history_comments
            INNER JOIN max_chat_history_comments ON id = max_id
    )

SELECT
    c.base_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    c.end_user_id,
    c.end_user_first_name,
    c.end_user_last_name,
    c.end_user_email,
    c.end_user_phone,
    c.end_user_os,
    c.end_user_url,
    c.status,
    first_content_message.created,
    c.updated,
    c.ended,
    c.forwarded_to_name,
    c.received_from,
    c.labels,
    s.comment,
    last_content_message.content AS last_message,
    messages_update_time.last_message_event,
    contacts_message.content AS contacts_message,
    messages_update_time.updated AS last_message_timestamp,
    (
        CASE WHEN title_visibility.value = 'true' THEN c.csa_title ELSE '' END
    ) AS csa_title
FROM unavailable_ended_chats AS c
    LEFT JOIN messages_update_time ON c.base_id = messages_update_time.chat_base_id
    LEFT JOIN
        chat_history_comments AS s
        ON  s.chat_id = messages_update_time.chat_base_id 
    LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
    LEFT JOIN first_content_message ON c.base_id = first_content_message.chat_base_id
    LEFT JOIN contacts_message ON c.base_id = contacts_message.chat_base_id
    CROSS JOIN title_visibility
WHERE
    c.created::DATE BETWEEN :start::date AND :end::date
    AND messages_update_time.event_lowercase IN (
        'unavailable_holiday',
        'unavailable-contact-information-fulfilled',
        'contact-information-skipped',
        'unavailable_organization',
        'unavailable_csas',
        'unavailable_csas_ask_contacts'
    )
ORDER BY created ASC limit :limit;
