WITH TitleVisibility AS (
    SELECT value
    FROM configuration
    WHERE NOT deleted AND key = 'is_csa_title_visible'
    ORDER BY id DESC
    LIMIT 1
),
LatestMessages AS (
    SELECT chat_base_id,
           MAX(CASE WHEN event = 'contact-information-fulfilled' THEN id END) AS contacts_message_id,
           MAX(CASE WHEN content <> '' AND content <> 'message-read' THEN id END) AS last_content_message_id,
           MIN(CASE WHEN content <> '' AND content <> 'message-read' THEN id END) AS first_content_message_id
    FROM message
    GROUP BY chat_base_id
)
SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       CASE WHEN conf.value = 'true' THEN c.csa_title ELSE '' END AS csa_title,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       c.end_user_email,
       c.end_user_phone,
       c.end_user_os,
       c.end_user_url,
       c.status,
       first_message.created AS created,
       c.updated,
       c.ended,
       c.forwarded_to_name,
       c.received_from,
       c.labels,
       s.comment,
       last_content_message.content AS last_message,
       LOWER(m.event) AS last_message_event,
       contacts_message.content AS contacts_message,
       m.updated AS last_message_timestamp
FROM (
    SELECT base_id, customer_support_id, customer_support_display_name, csa_title, end_user_id,
           end_user_first_name, end_user_last_name, end_user_email, end_user_phone, end_user_os,
           end_user_url, status, created, updated, ended, forwarded_to_name, received_from, labels
    FROM chat
    WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
    AND ended IS NOT NULL AND status <> 'IDLE'
) AS c
JOIN (
    SELECT chat_base_id, event, updated
    FROM message
    WHERE id IN (SELECT MAX(id) FROM message GROUP BY chat_base_id)
) AS m ON c.base_id = m.chat_base_id
LEFT JOIN (
    SELECT chat_id, comment
    FROM chat_history_comments
) AS s ON s.chat_id = m.chat_base_id
JOIN (
    SELECT chat_base_id, content
    FROM message
    WHERE id IN (SELECT last_content_message_id FROM LatestMessages)
) AS last_content_message ON c.base_id = m.chat_base_id
JOIN (
    SELECT chat_base_id, content, created
    FROM message
    WHERE id IN (SELECT first_content_message_id FROM LatestMessages)
) AS first_message ON c.base_id = first_message.chat_base_id
LEFT JOIN (
    SELECT chat_base_id, content
    FROM message
    WHERE id IN (SELECT contacts_message_id FROM LatestMessages)
) AS contacts_message ON c.base_id = contacts_message.chat_base_id
CROSS JOIN TitleVisibility AS conf
WHERE c.created::date BETWEEN :start::date AND :end::date
ORDER BY c.created ASC
LIMIT 100;
