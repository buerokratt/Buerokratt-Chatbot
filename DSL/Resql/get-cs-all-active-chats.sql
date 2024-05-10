WITH BotName AS (
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
),
MaxChats AS (
  SELECT MAX(id) maxId
  FROM chat
  GROUP BY base_id
),
FulfilledMessages AS (
  SELECT MAX(id) maxId
  FROM message
  WHERE event = 'contact-information-fulfilled'
  GROUP BY chat_base_id
),
MessageWithContent AS (
  SELECT MAX(id) AS maxId
  FROM message 
  WHERE content <> ''
  GROUP BY chat_base_id
),
MessageWithContentAndNotRatingOrForward AS (
  SELECT MAX(id) AS maxId
  FROM message
  WHERE event <> 'rating'
  AND event <> 'requested-chat-forward'
  AND content <> ''
  AND content <> 'message-read'
  GROUP BY chat_base_id
),
MessagaeNotRatingOrForwardEvents AS (
  SELECT MAX(id) AS maxId
  FROM message
  WHERE event <> 'rating'
  AND event <> 'requested-chat-forward'
  GROUP BY chat_base_id
),
ActiveChats AS (
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
  CROSS JOIN BotName
  JOIN MaxChats ON id = maxId
  AND ended IS NULL
  AND customer_support_id != BotName.value
),
ContactsMessage AS (
  SELECT chat_base_id, content
  FROM message
  JOIN FulfilledMessages ON id = maxId
),
LastEventMessage AS (
  SELECT event, chat_base_id
  FROM message
  JOIN MessageWithContent ON id = maxId
),
LastContentMessage AS (
  SELECT content, chat_base_id
  FROM message
  JOIN MessageWithContentAndNotRatingOrForward ON id = maxId
),
MessagesUpdateTime AS (
  SELECT updated, chat_base_id
  FROM message
  JOIN MessagaeNotRatingOrForwardEvents ON id = maxId
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
      ContactsMessage.content AS contacts_message,
      MessagesUpdateTime.updated AS last_message_timestamp,
      LastEventMessage.event AS last_message_event
FROM ActiveChats AS c
LEFT JOIN MessagesUpdateTime ON c.base_id = MessagesUpdateTime.chat_base_id
LEFT JOIN LastContentMessage ON c.base_id = LastContentMessage.chat_base_id
LEFT JOIN LastEventMessage ON c.base_id = LastEventMessage.chat_base_id
LEFT JOIN ContactsMessage ON ContactsMessage.chat_base_id = c.base_id
CROSS JOIN TitleVisibility
ORDER BY created ASC
LIMIT :limit;
