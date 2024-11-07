WITH LatestActiveUser AS (
  SELECT
    u.id_code, u.created, u.csa_title
  FROM
    "user" u INNER JOIN (
        SELECT iu.id_code, max(created) AS MaxCreated
        FROM "user" iu
        WHERE iu.status = 'active'
        GROUP BY iu.id_code
    ) iju ON iju.id_code = u.id_code AND iju.MaxCreated = u.created
)
SELECT m.content,
       m.event,
       m.created,
       m.author_role,
       COALESCE(m.author_first_name, u.first_name, u.display_name) AS author_first_name,
       COALESCE(m.author_last_name, u.last_name) AS author_last_name,
       u.csa_title,
       m.buttons,
       m.options
FROM message m
LEFT JOIN LatestActiveUser u ON m.author_id = u.id_code
WHERE m.chat_base_id = :chatId
  AND m.content != 'message-read'
ORDER BY m.id ASC;
