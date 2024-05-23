WITH MaxChatHistoryComments AS (
  SELECT MAX(id) AS maxId
  FROM chat_history_comments
  GROUP BY chat_id
),
ChatHistoryComments AS (
  SELECT comment, chat_id
  FROM chat_history_comments
  JOIN MaxChatHistoryComments ON id = maxId
),
MessageWithContent AS (
  SELECT 
    MAX(id) AS maxId,
    MIN(id) AS minId
  FROM message 
  WHERE content <> ''
  AND content <> 'message-read'
  GROUP BY chat_base_id
),
FirstContentMessage AS (
  SELECT created, chat_base_id
  FROM message
  JOIN MessageWithContent ON message.id = MessageWithContent.minId
),
LastContentMessage AS (
  SELECT content, chat_base_id
  FROM message
  JOIN MessageWithContent ON message.id = MessageWithContent.maxId
),
TitleVisibility AS (
  SELECT value
  FROM configuration
  WHERE key = 'is_csa_title_visible' 
  AND NOT deleted
  ORDER BY id DESC
  LIMIT 1
),
FulfilledMessages AS (
  SELECT MAX(id) AS maxId
  FROM message
  WHERE event = 'contact-information-fulfilled'
  GROUP BY chat_base_id
),
ContactsMessage AS (
  SELECT chat_base_id, content
  FROM message
  JOIN FulfilledMessages ON id = maxId
),
MaxMessages AS (
  SELECT MAX(id) AS maxId
  FROM message
  GROUP BY chat_base_id
),
Messages AS (
  SELECT event, updated, chat_base_id
  FROM message
  JOIN MaxMessages ON id = maxID
),
MaxChats AS (
  SELECT MAX(id) AS maxId
  FROM chat
  WHERE ended IS NOT NULL
  AND status <> 'IDLE'
  AND created::date BETWEEN :start::date AND :end::date
  GROUP BY base_id
),
EndedChatMessages AS (
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
  RIGHT JOIN MaxChats ON id = maxId
)
SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       (CASE WHEN TitleVisibility.value = 'true' THEN c.csa_title ELSE '' END) AS csa_title,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       c.end_user_email,
       c.end_user_phone,
       c.end_user_os,
       c.end_user_url,
       c.status,
       FirstContentMessage.created,
       c.updated,
       c.ended,
       c.forwarded_to_name,
       c.received_from,
       c.labels,
       s.comment,
       LastContentMessage.content AS last_message,
       (CASE WHEN m.event = '' THEN NULL ELSE LOWER(m.event) END) as last_message_event,
       ContactsMessage.content AS contacts_message,
       m.updated AS last_message_timestamp
FROM EndedChatMessages AS c
JOIN Messages AS m ON c.base_id = m.chat_base_id
LEFT JOIN ChatHistoryComments AS s ON s.chat_id =  m.chat_base_id
JOIN LastContentMessage ON c.base_id = LastContentMessage.chat_base_id
JOIN FirstContentMessage ON c.base_id = FirstContentMessage.chat_base_id
LEFT JOIN ContactsMessage ON ContactsMessage.chat_base_id = c.base_id
CROSS JOIN TitleVisibility
ORDER BY created DESC
LIMIT :limit;
