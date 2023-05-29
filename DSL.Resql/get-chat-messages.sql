WITH chat_labels AS (
  SELECT base_id, MAX(labels) AS labels
  FROM chat
  GROUP BY base_id
),
chat_comments AS (
  SELECT chat_id, comment
  FROM chat_history_comments
)
SELECT m.base_id      AS id,
       m.chat_base_id AS chat_id,
       m.content,
       m.event,
       m.author_id,
       m.author_timestamp,
       m.author_first_name,
       m.author_last_name,
       m.author_role,
       m.forwarded_by_user,
       m.forwarded_from_csa,
       m.forwarded_to_csa,
       c.labels,
       s.comment,
       m.rating,
       m.created,
       m.updated
FROM message m JOIN chat_labels c ON m.chat_base_id = c.base_id JOIN chat_comments s ON s.chat_id = m.chat_base_id
WHERE id IN (SELECT max(id) FROM message WHERE chat_base_id = :chatId GROUP BY base_id)
ORDER BY created;
