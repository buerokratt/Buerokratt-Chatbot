WITH latest_chat_records AS (
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
        first_message_timestamp,
        last_message_author_id,
        updated,
        ended,
        forwarded_to_name,
        received_from,
        labels,
        comment,
        comment_added_date,
        comment_author,
        customer_support_first_name,
        customer_support_last_name,
        first_message,
        last_message,
        contacts_message,
        last_message_timestamp,
        feedback_text,
        feedback_rating,
        CASE
            WHEN :is_csa_title_visible = 'true' THEN csa_title
            ELSE ''
        END AS csa_title,
        last_message_event,
        all_messages
    FROM chat.denormalized_chat
    ORDER BY chat_id, denormalized_record_created DESC
)

SELECT
    chat_id AS id,
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
    first_message_timestamp AS created,
    last_message_author_id,
    updated,
    ended,
    forwarded_to_name,
    received_from,
    labels,
    comment,
    comment_added_date,
    comment_author,
    customer_support_first_name,
    customer_support_last_name,
    last_message,
    contacts_message,
    last_message_timestamp,
    feedback_text,
    feedback_rating,
    csa_title,
    last_message_event,
    CEIL(COUNT(*) OVER() / :page_size::DECIMAL) AS total_pages
FROM latest_chat_records
WHERE 
                (ended IS NOT NULL
                AND status <> 'IDLE'
                AND ended::date BETWEEN :start::date AND :end::date
                AND first_message <> ''
                AND first_message <> 'message-read'
                AND last_message <> ''
                AND last_message <> 'message-read') AND
(LENGTH(:customerSupportIds) = 0
                OR customer_support_id = ANY(STRING_TO_ARRAY(:customerSupportIds, ',')))
            AND (
            :search IS NULL
            OR :search = ''
            OR customer_support_display_name ILIKE '%' || :search || '%'
            OR end_user_first_name ILIKE '%' || :search || '%'
            OR contacts_message ILIKE '%' || :search || '%'
            OR comment ILIKE '%' || :search || '%'
            OR status::text ILIKE '%' || :search || '%'
            OR last_message_event::text ILIKE '%' || :search || '%'
            OR chat_id ILIKE '%' || :search || '%'
            OR TO_CHAR(first_message_timestamp, 'DD.MM.YYYY HH24:MI:SS') ILIKE '%' || :search || '%'
            OR TO_CHAR(ended, 'DD.MM.YYYY HH24:MI:SS') ILIKE '%' || :search || '%'
            OR last_message ILIKE '%' || :search || '%'
            OR immutable_array_to_string(all_messages, ' ') ILIKE '%' || :search || '%'
        )
ORDER BY
    CASE WHEN :sorting = 'created asc' THEN first_message_timestamp END ASC,
    CASE WHEN :sorting = 'created desc' THEN first_message_timestamp END DESC,
    CASE WHEN :sorting = 'ended asc' THEN ended END ASC,
    CASE WHEN :sorting = 'ended desc' THEN ended END DESC,
    CASE WHEN :sorting = 'customerSupportDisplayName asc' THEN customer_support_display_name END ASC,
    CASE WHEN :sorting = 'customerSupportDisplayName desc' THEN customer_support_display_name END DESC,
    CASE WHEN :sorting = 'endUserName asc' THEN end_user_first_name END ASC,
    CASE WHEN :sorting = 'endUserName desc' THEN end_user_first_name END DESC,
    CASE WHEN :sorting = 'endUserId asc' THEN end_user_id END ASC,
    CASE WHEN :sorting = 'endUserId desc' THEN end_user_id END DESC,
    CASE WHEN :sorting = 'contactsMessage asc' THEN contacts_message END ASC,
    CASE WHEN :sorting = 'contactsMessage desc' THEN contacts_message END DESC,
    CASE WHEN :sorting = 'comment asc' THEN comment END ASC,
    CASE WHEN :sorting = 'comment desc' THEN comment END DESC,
    CASE WHEN :sorting = 'labels asc' THEN labels END ASC,
    CASE WHEN :sorting = 'labels desc' THEN labels END DESC,
    CASE WHEN :sorting = 'status asc' THEN 
        CASE WHEN last_message_event IS NULL OR last_message_event = '' THEN NULL 
        ELSE last_message_event END 
    END ASC NULLS LAST,
    CASE WHEN :sorting = 'status desc' THEN 
        CASE WHEN last_message_event IS NULL OR last_message_event = '' THEN NULL 
        ELSE last_message_event END 
    END DESC NULLS LAST,
    CASE WHEN :sorting = 'feedbackRating desc' THEN feedback_rating END DESC NULLS LAST,
    CASE WHEN :sorting = 'feedbackRating asc' THEN feedback_rating END ASC,
    CASE WHEN :sorting = 'customerSupportFullName desc' THEN 
        (customer_support_first_name || ' ' || customer_support_last_name) 
    END DESC NULLS LAST,
    CASE WHEN :sorting = 'customerSupportFullName asc' THEN 
        (customer_support_first_name || ' ' || customer_support_last_name) 
    END ASC NULLS LAST,
    CASE WHEN :sorting = 'id asc' THEN chat_id END ASC,
    CASE WHEN :sorting = 'id desc' THEN chat_id END DESC
LIMIT :page_size::integer OFFSET ((GREATEST(:page::integer, 1) - 1) * :page_size::integer);