WITH max_message AS (
  SELECT MAX(id) AS id, chat_base_id
  FROM message
  WHERE event <> 'rating'
    AND event <> 'requested-chat-forward'
  GROUP BY chat_base_id
),
max_content_message AS (
  SELECT MAX(id) AS id, chat_base_id
  FROM message
  WHERE event <> 'rating'
    AND event <> 'requested-chat-forward'
    AND content <> ''
    AND content <> 'message-read'
  GROUP BY chat_base_id
),
TitleVisibility AS (
  SELECT value
  FROM configuration
  WHERE KEY = 'is_csa_title_visible' AND NOT deleted
  ORDER BY id DESC
  LIMIT 1
)
SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       (CASE
            WHEN TitleVisibility.value = 'true' THEN c.csa_title
            ELSE ''
        END) AS csa_title,
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
       last_content_message.content AS last_message,
       contacts_message.content AS contacts_message,
       m.updated AS last_message_timestamp,
       last_message_event.event AS last_message_event
FROM chat AS c
JOIN message AS m ON c.base_id = m.chat_base_id
JOIN max_message ON m.id = max_message.id
JOIN message AS last_content_message ON c.base_id = last_content_message.chat_base_id
JOIN max_content_message ON last_content_message.id = max_content_message.id
LEFT JOIN message AS contacts_message ON c.base_id = contacts_message.chat_base_id AND contacts_message.event = 'contact-information-fulfilled'
LEFT JOIN message AS last_message_event ON c.base_id = last_message_event.chat_base_id AND last_message_event.event <> ''
CROSS JOIN TitleVisibility
WHERE c.status = 'IDLE'
ORDER BY c.created ASC
LIMIT 100;
