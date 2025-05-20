WITH LatestMessages AS (
  SELECT DISTINCT ON (base_id)
    m.id, m.base_id, m.chat_base_id, m.content, m.buttons, m.options, 
    m.event, m.author_id, m.author_timestamp, m.author_first_name, 
    m.author_last_name, m.author_role, m.forwarded_by_user, 
    m.forwarded_from_csa, m.forwarded_to_csa, m.rating, 
    m.created, m.updated
  FROM message m
  WHERE m.chat_base_id = :chatId
  ORDER BY m.base_id, m.updated DESC
)
SELECT 
  lm.base_id AS id,
  lm.chat_base_id AS chat_id,
  lm.content,
  lm.buttons,
  lm.options,
  lm.event,
  lm.author_id,
  lm.author_timestamp,
  lm.author_first_name,
  lm.author_last_name,
  lm.author_role,
  lm.forwarded_by_user,
  lm.forwarded_from_csa,
  lm.forwarded_to_csa,
  lm.rating,
  lm.created,
  lm.updated
FROM LatestMessages lm
WHERE :timeRangeBegin::timestamp with time zone < lm.updated
ORDER BY lm.created ASC;