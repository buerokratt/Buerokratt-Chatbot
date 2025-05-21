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
    last_message_with_content_and_not_rating_or_forward AS last_message,
    contacts_message,
    last_message_with_not_rating_or_forward_events_timestamp AS last_message_timestamp,
    last_message_event_with_content,
    CASE
        WHEN :is_csa_title_visible = 'true' THEN csa_title
        ELSE ''
    END AS csa_title

FROM latest_chat_versions
WHERE 
    ended IS NULL 
    AND customer_support_id <> :bot_institution_id
    AND status <> 'VALIDATING'
ORDER BY created ASC
LIMIT :limit::INTEGER;
