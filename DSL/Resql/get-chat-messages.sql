WITH RECURSIVE MessageChain AS (
    SELECT 
        m.*
    FROM message m
    WHERE m.chat_base_id = :chatId
    UNION ALL
    SELECT 
        m.*
    FROM message m
    INNER JOIN MessageChain mc ON m.original_base_id = mc.base_id
),
FilteredMessages AS (
    SELECT DISTINCT ON (mc.base_id) mc.*
    FROM MessageChain mc
    LEFT JOIN MessageChain mc2 ON mc.base_id = mc2.original_base_id
    WHERE mc2.base_id IS NULL
),
LatestActiveUser AS (
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
SELECT fm.base_id      AS id,
       fm.chat_base_id AS chat_id,
       fm.content,
       fm.buttons,
       fm.options,
       fm.event,
       fm.author_id,
       fm.author_timestamp,
       fm.author_first_name,
       fm.author_last_name,
       fm.author_role,
       fm.forwarded_by_user,
       fm.forwarded_from_csa,
       fm.forwarded_to_csa,
       fm.original_base_id,
       fm.rating,
       fm.created,
       fm.updated,
       u.csa_title
FROM FilteredMessages fm
LEFT JOIN LatestActiveUser u ON fm.author_id = u.id_code
ORDER BY fm.created ASC;
