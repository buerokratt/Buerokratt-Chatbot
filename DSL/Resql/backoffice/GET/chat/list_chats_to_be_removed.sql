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
        updated,
        ended,
        forwarded_to_name,
        received_from,
        labels,
        comment,
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
    FROM denormalized_chat
    ORDER BY chat_id, id DESC
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
    updated,
    ended,
    forwarded_to_name,
    received_from,
    labels,
    comment,
    last_message,
    contacts_message,
    last_message_timestamp,
    feedback_text,
    feedback_rating,
    csa_title,
    last_message_event,
    CEIL(COUNT(*) OVER () / 10::DECIMAL) AS total_pages
FROM latest_chat_records
Where (
    (
                ended IS NOT NULL
                AND status <> 'IDLE'
                AND (
                    (
                        end_user_id IS NOT NULL
                        AND end_user_id <> ''
                        AND ended::DATE <= :auth_date::DATE
                    )
                    OR
                    (
                        end_user_id IS NULL
                        OR end_user_id = '' AND ended::DATE <= :anon_date::DATE
                    )
                )
                AND first_message <> ''
                AND first_message <> 'message-read'
                AND last_message <> ''
                AND last_message <> 'message-read'
            ) AND
            (
                :search IS NULL
                OR :search = ''
                OR customer_support_display_name ILIKE '%' || :search || '%'
                OR end_user_first_name ILIKE '%' || :search || '%'
                OR contacts_message ILIKE '%' || :search || '%'
                OR comment ILIKE '%' || :search || '%'
                OR status ILIKE '%' || :search || '%'
                OR last_message_event ILIKE '%' || :search || '%'
                OR chat_id ILIKE '%' || :search || '%'
                OR TO_CHAR(first_message_timestamp, 'DD.MM.YYYY HH24:MI:SS') ILIKE '%' || :search || '%'
                OR TO_CHAR(ended, 'DD.MM.YYYY HH24:MI:SS') ILIKE '%' || :search || '%'
                OR last_message ILIKE '%' || :search || '%'
                OR EXISTS (
                    SELECT 1
                    FROM unnest(all_messages) AS message_content
                    WHERE message_content ILIKE '%' || :search || '%'
                )
            )
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
    CASE WHEN :sorting = 'status asc' THEN status END ASC,
    CASE WHEN :sorting = 'status desc' THEN status END DESC,
    CASE WHEN :sorting = 'id asc' THEN chat_id END ASC,
    CASE WHEN :sorting = 'id desc' THEN chat_id END DESC
LIMIT :page_size OFFSET ((GREATEST(:page, 1) - 1) * :page_size);