WITH LatestMessages AS (
    SELECT
        chat_base_id,
        MAX(CASE WHEN event = 'contact-information-fulfilled' THEN id END) AS contacts_message_id,
        MAX(CASE WHEN event <> '' THEN id END) AS last_message_id,
        MAX(CASE WHEN event <> '' AND content <> '' AND content <> 'message-read' THEN id END) AS last_content_message_id
    FROM message
    WHERE event <> 'rating' AND event <> 'requested-chat-forward'
    GROUP BY chat_base_id
),
BotName AS (
  SELECT value
  FROM configuration
  WHERE NOT deleted AND key = 'bot_institution_id'
  ORDER BY id DESC
  LIMIT 1
),
TitleVisibility AS (
  SELECT value
  FROM configuration
  WHERE NOT deleted AND key = 'is_csa_title_visible'
  ORDER BY id DESC
  LIMIT 1
)
SELECT
    c.base_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    CASE WHEN titlevisibility.value = 'true' THEN c.csa_title ELSE '' END AS csa_title,
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
    m_last.content AS last_message,
    m_contacts.content AS contacts_message,
    m_last.updated AS last_message_timestamp,
    m_last_event.event AS last_message_event
FROM
(
  SELECT base_id, customer_support_id, customer_support_display_name, csa_title, end_user_id, 
    end_user_first_name, end_user_last_name, status, created, updated, ended, end_user_email, 
    end_user_phone, end_user_os, end_user_url, external_id, forwarded_to, forwarded_to_name,
    received_from, received_from_name
    FROM chat
    CROSS JOIN BotName as botname
    WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
      AND ended IS NULL
      AND customer_support_id != botname.value
) AS c
LEFT JOIN LatestMessages lc ON c.base_id = lc.chat_base_id
LEFT JOIN message m_last ON lc.last_message_id = m_last.id
LEFT JOIN message m_contacts ON lc.contacts_message_id = m_contacts.id
LEFT JOIN message m_last_event ON lc.last_content_message_id = m_last_event.id
CROSS JOIN TitleVisibility AS titlevisibility
ORDER BY created ASC
LIMIT :limit;

