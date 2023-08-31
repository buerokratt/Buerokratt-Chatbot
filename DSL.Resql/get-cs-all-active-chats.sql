SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       (CASE
            WHEN
                   (SELECT value
                    FROM configuration
                    WHERE KEY = 'is_csa_title_visible'
                      AND configuration.id IN
                        (SELECT max(id)
                         FROM configuration
                         GROUP BY KEY)
                      AND deleted = FALSE) = 'true' THEN c.csa_title
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

  (SELECT content
   FROM message
   WHERE id IN (
                  (SELECT MAX(id)
                   FROM message
                   WHERE event = 'contact-information-fulfilled'
                     AND chat_base_id = c.base_id))) AS contacts_message,
       m.updated AS last_message_timestamp,

  (SELECT event
   FROM message
   WHERE id IN (
                  (SELECT MAX(id)
                   FROM message
                   WHERE event <> ''
                     AND chat_base_id = c.base_id))) AS last_message_event
FROM
  (SELECT *
   FROM chat
   WHERE id IN
       (SELECT MAX(id)
        FROM chat
        GROUP BY base_id)
     AND ended IS NULL
     AND customer_support_id !=
       (SELECT value
        FROM configuration
        WHERE KEY = 'bot_institution_id'
          AND id IN
            (SELECT max(id)
             FROM configuration
             GROUP BY KEY)
          AND deleted = FALSE)) AS c
JOIN
  (SELECT *
   FROM message
   WHERE id IN
       (SELECT MAX(id)
        FROM message
        WHERE event <> 'rating'
          AND event <> 'requested-chat-forward'
        GROUP BY chat_base_id)) AS m ON c.base_id = m.chat_base_id
JOIN
  (SELECT *
   FROM message
   WHERE id IN
       (SELECT MAX(id)
        FROM message
        WHERE event <> 'rating'
          AND event <> 'requested-chat-forward'
          AND content <> ''
          AND content <> 'message-read'
        GROUP BY chat_base_id)) AS last_content_message ON c.base_id = last_content_message.chat_base_id
ORDER BY created;
