WITH TitleVisibility AS (
  SELECT value
  FROM configuration
  WHERE NOT deleted AND key = 'is_csa_title_visible'
  ORDER BY id DESC
  LIMIT 1
),
FulfilledMessages AS (
  SELECT MAX(id) maxId
  FROM message
  WHERE event = 'contact-information-fulfilled'
  GROUP BY chat_base_id
),
ContactsMessage AS (
  SELECT chat_base_id, content
  FROM message
  JOIN FulfilledMessages ON id = maxId
),
MaxChats AS (
  SELECT MAX(id) maxId
  FROM chat
  GROUP BY base_id
),
UnavailableEndedChats AS (
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
  JOIN MaxChats ON id = maxId
  AND ended IS NOT null
),
MaxMessages AS (
  SELECT MAX(id) maxId
  FROM message
  GROUP BY chat_base_id
),
MessagesUpdateTime AS (
  SELECT 
    updated,
    chat_base_id,
    LOWER(event) AS event_lowercase,
    (
      CASE
        WHEN event = '' THEN NULL
        ELSE LOWER(event)
      END
    ) AS last_message_event
  FROM message
  JOIN MaxMessages ON id = maxId
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
MaxChatHistoryComments AS (
  SELECT MAX(id) AS maxId
  FROM chat_history_comments
  GROUP BY chat_id
),
ChatHistoryComments AS (
  SELECT comment, chat_id
  FROM chat_history_comments
  JOIN MaxChatHistoryComments ON id = maxId
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
       MessagesUpdateTime.last_message_event AS last_message_event,
       ContactsMessage.content AS contacts_message,
       MessagesUpdateTime.updated AS last_message_timestamp
FROM UnavailableEndedChats AS c
LEFT JOIN MessagesUpdateTime ON c.base_id = MessagesUpdateTime.chat_base_id
LEFT JOIN ChatHistoryComments AS s ON s.chat_id = MessagesUpdateTime.chat_base_id
LEFT JOIN LastContentMessage ON c.base_id = LastContentMessage.chat_base_id
LEFT JOIN FirstContentMessage ON c.base_id = FirstContentMessage.chat_base_id
LEFT JOIN ContactsMessage ON ContactsMessage.chat_base_id = c.base_id
CROSS JOIN TitleVisibility
WHERE c.created::date BETWEEN :start::date AND :end::date
AND MessagesUpdateTime.event_lowercase IN (
        'unavailable_holiday',
        'unavailable-contact-information-fulfilled',
        'contact-information-skipped',
        'unavailable_organization',
        'unavailable_csas')
ORDER BY created ASC
LIMIT :limit;
