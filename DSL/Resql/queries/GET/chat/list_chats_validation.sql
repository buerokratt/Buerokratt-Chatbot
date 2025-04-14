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
    received_from,
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
FROM (
    SELECT
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
        updated,
        ended,
        forwarded_to,
        forwarded_to_name,
        received_from,
        received_from_name,
        external_id,
        contacts_message,
        csa_title,
        CASE WHEN last_message_event IS NULL OR last_message_event = '' THEN NULL 
        ELSE last_message_event END AS last_message_event,
        created,
        ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY id DESC) as rn
    FROM denormalized_chat
) AS c
WHERE rn = 1
  AND ended IS NULL
  AND last_message_event = 'waiting_validation'
ORDER BY created ASC 
LIMIT :limit;
