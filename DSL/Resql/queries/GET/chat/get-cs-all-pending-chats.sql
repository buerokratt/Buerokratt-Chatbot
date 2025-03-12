WITH TitleVisibility AS (
  SELECT value
  FROM configuration
  WHERE KEY = 'is_csa_title_visible' AND NOT deleted
  ORDER BY id DESC
  LIMIT 1
),
MessageWithContentAndNotRatingOrForward AS (
    SELECT MAX(id) maxId
    FROM message
    WHERE event <> 'rating'
    AND event <> 'requested-chat-forward'
    AND content <> ''
    AND content <> 'message-read'
    GROUP BY chat_base_id
),
LastContentMessage AS (
  SELECT content, chat_base_id
  FROM message
  JOIN MessageWithContentAndNotRatingOrForward ON id = maxId
),
MessageNotRatingOrForward AS (
  SELECT MAX(id) maxId
  FROM message
  WHERE event <> 'rating'
  AND event <> 'requested-chat-forward'
  GROUP BY chat_base_id
),
LastMessagesTime AS (
  SELECT updated, chat_base_id
  FROM message
  JOIN MessageNotRatingOrForward ON id = maxId
),
MaxChats AS (
  SELECT MAX(id) maxId
  FROM chat
  GROUP BY base_id
),
IdleChats AS (
  SELECT 
    base_id,
    customer_support_id,
    customer_support_display_name,
    csa_title,
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
    received_from_name
  FROM chat
  JOIN MaxChats ON id = maxId
  WHERE status = 'IDLE'
),
MessagesWithEvent AS (
  SELECT MAX(id) maxId
  FROM message
  WHERE event <> ''
  GROUP BY chat_base_id
),
LastMessageEvent AS (
  SELECT event, chat_base_id
  FROM message
  JOIN MessagesWithEvent ON id = maxId
),
FulfilledMessage AS (
  SELECT MAX(id) maxId
  FROM message
  WHERE event = 'contact-information-fulfilled'
  GROUP BY chat_base_id
),
ContactMessage AS (
  SELECT content, chat_base_id
  FROM message
  JOIN FulfilledMessage ON id = maxId
)
SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       (CASE WHEN TitleVisibility.value = 'true' THEN c.csa_title ELSE '' END) AS csa_title,
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
       LastContentMessage.content AS last_message,
       ContactMessage.content AS contacts_message,
       m.updated AS last_message_timestamp,
       LastMessageEvent.event AS last_message_event
FROM IdleChats AS c
LEFT JOIN LastMessagesTime AS m ON c.base_id = m.chat_base_id
LEFT JOIN LastContentMessage ON c.base_id = LastContentMessage.chat_base_id
LEFT JOIN LastMessageEvent ON LastMessageEvent.chat_base_id = c.base_id
LEFT JOIN ContactMessage ON ContactMessage.chat_base_id = c.base_id
CROSS JOIN TitleVisibility
ORDER BY created ASC
LIMIT :limit;
