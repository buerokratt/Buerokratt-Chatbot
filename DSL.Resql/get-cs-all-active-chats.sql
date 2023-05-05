SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       c.status,
       c.created,
       c.updated,
       c.ended,
       c.end_user_os,
       c.end_user_url,
       c.external_id,
       c.forwarded_to,
       c.forwarded_to_name,
       c.received_from,
       c.received_from_name,
       m.content                                                                           AS last_message,
       (SELECT content
        FROM message
        WHERE id IN (
            (SELECT MAX(id)
             FROM message
             WHERE event = 'contact-information-fulfilled' AND chat_base_id = c.base_id))) AS contacts_message,
       m.updated                                                                           AS last_message_timestamp,
       (SELECT event
        FROM message
        WHERE id IN (
            (SELECT MAX(id)
             FROM message
             WHERE event <> '' AND chat_base_id = c.base_id)))                             AS last_message_event
FROM (SELECT *
      FROM chat
      WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
        AND ended IS null
        AND customer_support_id != (SELECT value
                                    FROM configuration
                                    WHERE key = 'bot_institution_id'
                                      AND id IN (SELECT max(id) from configuration GROUP BY key)
                                      AND deleted = FALSE)) AS c
         JOIN (SELECT *
               FROM message
               WHERE id IN (SELECT MAX(id)
                            FROM message
                            WHERE event <> 'rating' AND event <> 'requested-chat-forward'
                            GROUP BY chat_base_id)) AS m
              ON c.base_id = m.chat_base_id
ORDER BY created;
