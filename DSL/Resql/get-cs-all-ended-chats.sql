WITH MaxChatHistoryComments AS (
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
       (CASE WHEN (SELECT value FROM configuration WHERE key = 'is_csa_title_visible' AND configuration.id IN (SELECT max(id) from configuration GROUP BY key) AND deleted = false) = 'true'
                 THEN c.csa_title ELSE '' END) AS csa_title,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       c.end_user_email,
       c.end_user_phone,
       c.end_user_os,
       c.end_user_url,
       c.status,
       first_message.created,
       c.updated,
       c.ended,
       c.forwarded_to_name,
       c.received_from,
       c.labels,
       s.comment,
       last_content_message.content AS last_message,
       (CASE WHEN m.event = '' THEN NULL ELSE LOWER(m.event) END) as last_message_event,
       (SELECT content
        FROM message
        WHERE id IN (
            (SELECT MAX(id) FROM message WHERE event = 'contact-information-fulfilled' AND chat_base_id = c.base_id))) AS contacts_message,
       m.updated AS last_message_timestamp
FROM (SELECT * FROM chat WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id) AND ended IS NOT null AND status <> 'IDLE') AS c
  JOIN (SELECT * FROM message WHERE id IN (SELECT MAX(id) FROM message GROUP BY chat_base_id)) AS m
  ON c.base_id = m.chat_base_id
  LEFT JOIN ChatHistoryComments AS s ON s.chat_id =  m.chat_base_id
  JOIN (SELECT * FROM message WHERE id IN (SELECT MAX(id) FROM message 
          WHERE content <> ''
          AND content <> 'message-read' GROUP BY chat_base_id)) AS last_content_message
  ON c.base_id = last_content_message.chat_base_id
  JOIN (SELECT * FROM message WHERE id IN (SELECT MIN(id) FROM message 
          WHERE content <> ''
          AND content <> 'message-read' GROUP BY chat_base_id)) AS first_message
  ON c.base_id = first_message.chat_base_id
WHERE c.created::date BETWEEN :start::date AND :end::date
ORDER BY created;
