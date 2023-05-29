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
       c.created,
       c.updated,
       c.ended,
       c.forwarded_to_name,
       c.received_from,
       c.labels,
       s.comment,
       m.content AS last_message,
       (CASE WHEN m.event = '' THEN NULL ELSE LOWER(m.event) END) as last_message_event,
       (SELECT content
        FROM message
        WHERE id IN (
            (SELECT MAX(id) FROM message WHERE event = 'contact-information-fulfilled' AND chat_base_id = c.base_id))) AS contacts_message,
       m.updated AS last_message_timestamp
FROM (SELECT * FROM chat WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id) AND ended IS NOT null) AS c
  JOIN (SELECT * FROM message WHERE id IN (SELECT MAX(id) FROM message GROUP BY chat_base_id)) AS m
  ON c.base_id = m.chat_base_id
  LEFT JOIN (SELECT chat_id, comment FROM chat_history_comments) AS s
  ON s.chat_id =  m.chat_base_id
ORDER BY created;
