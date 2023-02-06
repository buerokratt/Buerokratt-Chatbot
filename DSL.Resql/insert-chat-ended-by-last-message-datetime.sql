WITH chat_base_ids AS (SELECT m.chat_base_id
                       FROM (SELECT chat_base_id
                             FROM message
                             WHERE id IN (SELECT MAX(id)
                                          FROM message
                                          WHERE author_role = :targetUser
                                            AND author_timestamp >
                                                (:currentDatetime::timestamp with time zone -
                                                 :interval::interval)
                                          GROUP BY chat_base_id)) AS m
                                JOIN (SELECT id, base_id
                                      FROM chat
                                      WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
                                        AND status = :currentStatus
                                        AND ended IS null
                                        AND customer_support_id IN (SELECT value
                                                                    FROM configuration
                                                                    WHERE key = 'bot_institution_id'
                                                                      AND id IN (SELECT max(id) FROM configuration GROUP BY key)
                                                                      AND deleted = FALSE)) AS c
                                     ON m.chat_base_id = c.base_id)
INSERT
INTO message(chat_base_id, base_id, content, event, author_timestamp, author_id, author_first_name,
             author_last_name, author_role, rating, created)
SELECT chat_base_id,
       (SELECT uuid_in(md5(random()::text)::cstring)),
       :content,
       :event,
       :currentDatetime::timestamp with time zone,
       :authorId,
       author_first_name,
       author_last_name,
       :authorRole,
       rating,
       :currentDatetime::timestamp with time zone
FROM message
         JOIN (SELECT base_id
               FROM chat
               WHERE id IN (SELECT max(id) FROM chat GROUP BY base_id)
                 AND customer_support_id = :authorId
                 AND status = :currentStatus
                 AND ended IS NULL) as message_active_chats
              ON message.chat_base_id = message_active_chats.base_id
WHERE chat_base_id NOT IN (SELECT chat_base_ids.chat_base_id FROM chat_base_ids)
  AND id IN (SELECT max(id) FROM message GROUP BY chat_base_id);

WITH active_chats AS (SELECT c.id
                      FROM (SELECT *
                            FROM chat
                            WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
                              AND status = :currentStatus
                              AND ended IS null
                              AND customer_support_id IN (SELECT value
                                                          FROM configuration
                                                          WHERE key = 'bot_institution_id'
                                                            AND id IN (SELECT max(id) FROM configuration GROUP BY key)
                                                            AND deleted = FALSE)) AS c
                               JOIN (SELECT chat_base_id
                                     FROM message
                                     WHERE id IN (SELECT MAX(id)
                                                  FROM message
                                                  WHERE author_role = :targetUser
                                                    AND author_timestamp >
                                                        (:currentDatetime::timestamp with time zone - :interval::interval)
                                                  GROUP BY chat_base_id)) AS m
                                    ON c.base_id = m.chat_base_id)
INSERT
INTO chat(base_id, customer_support_id, customer_support_display_name, end_user_id, end_user_first_name,
          end_user_last_name, status, created, ended, end_user_email, end_user_phone, end_user_os, end_user_url, feedback_text, feedback_rating,
          external_id, forwarded_to, forwarded_to_name, received_from, received_from_name)
SELECT c.base_id,
       c.customer_support_id,
       c.customer_support_display_name,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       :newStatus,
       c.created,
       :currentDatetime::timestamp with time zone,
       c.end_user_email,
       c.end_user_phone,
       c.end_user_os,
       c.end_user_url,
       c.feedback_text,
       c.feedback_rating,
       c.external_id,
       c.forwarded_to,
       c.forwarded_to_name,
       c.received_from,
       c.received_from_name
FROM chat c
WHERE c.id IN (SELECT max(chat.id) FROM chat GROUP BY chat.base_id)
  AND c.id NOT IN (SELECT id FROM active_chats)
  AND c.customer_support_id = :authorId
  AND c.status = :currentStatus
  AND c.ended IS null;