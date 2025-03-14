WITH
    max_chat_history_comments AS (
        SELECT MAX(id) AS max_id
        FROM chat_history_comments
        GROUP BY chat_id
    ),

    chat_user AS (
        SELECT DISTINCT ON (id_code)
            id_code,
            display_name,
            first_name,
            last_name
        FROM "user"
        ORDER BY id_code ASC, id DESC
    ),

    chat_history_comments AS (
        SELECT
            comment,
            chat_id,
            created,
            author_display_name
        FROM chat_history_comments
            INNER JOIN max_chat_history_comments ON id = max_id
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

    title_visibility AS (
        SELECT value
        FROM configuration
        WHERE
            key = 'is_csa_title_visible'
            AND NOT deleted
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

    max_messages AS (
        SELECT MAX(id) AS max_id
        FROM message
        GROUP BY chat_base_id
    ),

    messages AS (
        SELECT
            event,
            updated,
            chat_base_id,
            author_id
        FROM message
            INNER JOIN max_messages ON id = max_id
    ),

    max_chats AS (
        SELECT MAX(id) AS max_id
        FROM chat
        WHERE
            ended IS NOT NULL
            AND status <> 'IDLE'
        GROUP BY base_id
    ),

    ended_chat_messages AS (
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
            created,
            feedback_text,
            feedback_rating
        FROM chat
            RIGHT JOIN max_chats ON id = max_id
    ),

    rated_chats AS (
        SELECT MAX(feedback_rating) AS rating
        FROM chat
        WHERE feedback_rating IS NOT NULL
        GROUP BY base_id
    ),

    rated_chats_count AS (
        SELECT COUNT(rating) AS total FROM rated_chats
    ),

    promoters AS (
        SELECT COUNT(rating) AS p FROM rated_chats
        WHERE rating >= 9
    ),

    detractors AS (
        SELECT COUNT(rating) AS d FROM rated_chats
        WHERE rating <= 6
    ),

    nps AS (
        SELECT ROUND(((p / (GREATEST(total, 1) * 1.0)) - (d / (GREATEST(total, 1) * 1.0))) * 100.0, 2) AS nps
        FROM rated_chats_count
            CROSS JOIN promoters
            CROSS JOIN detractors
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
    s.created AS comment_added_date,
    s.author_display_name AS comment_author,
    mu.display_name AS user_display_name,
    cu.first_name AS customer_support_first_name,
    cu.last_name AS customer_support_last_name,
    last_content_message.content AS last_message,
    contacts_message.content AS contacts_message,
    m.updated AS last_message_timestamp,
    c.feedback_text,
    c.feedback_rating,
    nps,
    (
        CASE WHEN title_visibility.value = 'true' THEN c.csa_title ELSE '' END
    ) AS csa_title,
    (CASE WHEN m.event = '' THEN NULL ELSE LOWER(m.event) END) AS last_message_event,
    CEIL(COUNT(*) OVER () / :page_size::DECIMAL) AS total_pages
FROM ended_chat_messages AS c
    INNER JOIN messages AS m ON c.base_id = m.chat_base_id
    LEFT JOIN chat_history_comments AS s ON m.chat_base_id = s.chat_id
    LEFT JOIN chat_user AS mu ON m.author_id = mu.id_code
    LEFT JOIN chat_user AS cu ON c.customer_support_id = cu.id_code
    INNER JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
    INNER JOIN first_content_message ON c.base_id = first_content_message.chat_base_id
    LEFT JOIN contacts_message ON c.base_id = contacts_message.chat_base_id
    CROSS JOIN title_visibility
    CROSS JOIN nps
WHERE (
    (
        LENGTH(:customerSupportIds) = 0
        OR c.customer_support_id = ANY(STRING_TO_ARRAY(:customerSupportIds, ','))
    ) AND (
        :search IS NULL
        OR :search = ''
        OR LOWER(c.customer_support_display_name) LIKE LOWER('%' || :search || '%')
        OR LOWER(c.end_user_first_name) LIKE LOWER('%' || :search || '%')
        OR LOWER(contacts_message.content) LIKE LOWER('%' || :search || '%')
        OR LOWER(s.comment) LIKE LOWER('%' || :search || '%')
        OR LOWER(c.status) LIKE LOWER('%' || :search || '%')
        OR LOWER(m.event) LIKE LOWER('%' || :search || '%')
        OR LOWER(c.base_id) LIKE LOWER('%' || :search || '%')
        OR TO_CHAR(first_content_message.created, 'DD.MM.YYYY HH24:MI:SS') LIKE '%'
        || :search
        || '%'
        OR TO_CHAR(c.ended, 'DD.MM.YYYY HH24:MI:SS') LIKE '%' || :search || '%'
        OR EXISTS (
            SELECT 1
            FROM message AS msg
            WHERE
                msg.chat_base_id = c.base_id
                AND LOWER(msg.content) LIKE LOWER('%' || :search || '%')
        )
    )
)
ORDER BY
    CASE WHEN :sorting = 'created asc' THEN first_content_message.created END ASC,
    CASE WHEN :sorting = 'created desc' THEN first_content_message.created END DESC,
    CASE WHEN :sorting = 'ended asc' THEN c.ended END ASC,
    CASE WHEN :sorting = 'ended desc' THEN c.ended END DESC,
    CASE
        WHEN
            :sorting = 'customerSupportDisplayName asc'
            THEN c.customer_support_display_name
    END ASC,
    CASE
        WHEN
            :sorting = 'customerSupportDisplayName desc'
            THEN c.customer_support_display_name
    END DESC,
    CASE WHEN :sorting = 'endUserName asc' THEN c.end_user_first_name END ASC,
    CASE WHEN :sorting = 'endUserName desc' THEN c.end_user_first_name END DESC,
    CASE WHEN :sorting = 'endUserId asc' THEN c.end_user_id END ASC,
    CASE WHEN :sorting = 'endUserId desc' THEN c.end_user_id END DESC,
    CASE WHEN :sorting = 'contactsMessage asc' THEN contacts_message.content END ASC,
    CASE WHEN :sorting = 'contactsMessage desc' THEN contacts_message.content END DESC,
    CASE WHEN :sorting = 'comment asc' THEN s.comment END ASC,
    CASE WHEN :sorting = 'comment desc' THEN s.comment END DESC,
    CASE WHEN :sorting = 'labels asc' THEN c.labels END ASC,
    CASE WHEN :sorting = 'labels desc' THEN c.labels END DESC,
    CASE
        WHEN :sorting = 'status asc' THEN
            CASE
                WHEN m.event IS NULL OR m.event = '' THEN NULL
                ELSE m.event
            END
    END ASC NULLS LAST,
    CASE
        WHEN :sorting = 'status desc' THEN
            CASE
                WHEN m.event IS NULL OR m.event = '' THEN NULL
                ELSE m.event
            END
    END DESC NULLS LAST,
    CASE
        WHEN :sorting = 'feedbackRating desc' THEN c.feedback_rating
    END DESC NULLS LAST,
    CASE WHEN :sorting = 'feedbackRating asc' THEN c.feedback_rating END ASC,
    CASE
        WHEN
            :sorting = 'customerSupportFullName desc'
            THEN (cu.first_name || ' ' || cu.last_name)
    END DESC NULLS LAST,
    CASE
        WHEN
            :sorting = 'customerSupportFullName asc'
            THEN (cu.first_name || ' ' || cu.last_name)
    END ASC NULLS LAST,
    CASE WHEN :sorting = 'id asc' THEN c.base_id END ASC,
    CASE WHEN :sorting = 'id desc' THEN c.base_id END DESC
LIMIT :page_size OFFSET ((GREATEST(:page, 1) - 1) * :page_size);
