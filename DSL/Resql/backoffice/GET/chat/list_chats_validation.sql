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
    last_message_with_content_and_not_rating_or_forward AS last_message,
    contacts_message,
    last_message_with_not_rating_or_forward_events_timestamp AS last_message_timestamp,
    last_non_empty_message_event AS last_message_event,
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
        CASE
            WHEN :is_csa_title_visible = 'true' THEN csa_title
            ELSE ''
        END AS csa_title,
        CASE WHEN last_message_event IS NULL OR last_message_event = '' THEN NULL 
        ELSE last_message_event END AS last_message_event,
        created,
        last_message_with_content_and_not_rating_or_forward,
        last_message_with_not_rating_or_forward_events_timestamp,
        last_non_empty_message_event,
        ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY denormalized_record_created DESC) as rn
    FROM denormalized_chat
) AS c
WHERE rn = 1
  AND ended IS NULL
  AND last_message_event = 'waiting_validation'
ORDER BY created ASC
LIMIT :limit::INTEGER;
