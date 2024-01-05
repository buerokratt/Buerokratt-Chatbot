INSERT INTO message(chat_base_id, base_id, content, event, author_timestamp, author_id, author_first_name,
                    author_last_name, author_role, rating, created)
SELECT chat_base_id,
       (SELECT uuid_in(md5(random()::text)::cstring)),
       :content,
       :event,
       :created::timestamp with time zone,
       :authorId,
       author_first_name,
       author_last_name,
       :authorRole,
       rating,
       :created::timestamp with time zone
FROM message
WHERE chat_base_id IN (SELECT base_id
                       FROM chat
                       WHERE id IN (SELECT max(id) FROM chat GROUP BY base_id)
                         AND customer_support_id = :customerSupportId
                         AND ended IS null)
  AND id IN (SELECT max(id) FROM message GROUP BY chat_base_id);