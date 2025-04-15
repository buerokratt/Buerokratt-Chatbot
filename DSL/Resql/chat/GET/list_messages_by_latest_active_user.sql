WITH
    latest_active_user AS (
        SELECT
            u.id_code,
            u.created,
            u.csa_title,
            u.first_name,
            u.last_name,
            u.display_name
        FROM
            "user" AS u INNER JOIN (
            SELECT
                iu.id_code,
                MAX(iu.created) AS max_created
            FROM "user" AS iu
            WHERE iu.status = 'active'
            GROUP BY iu.id_code
        ) AS iju ON u.id_code = iju.id_code AND u.created = iju.max_created
    )

SELECT
    m.content,
    m.event,
    m.created,
    m.author_role,
    u.csa_title,
    m.buttons,
    m.options,
    COALESCE(m.author_first_name, u.first_name, u.display_name) AS author_first_name,
    COALESCE(m.author_last_name, u.last_name) AS author_last_name
FROM message AS m
    LEFT JOIN latest_active_user AS u ON m.author_id = u.id_code
WHERE
    m.chat_base_id = :chatId
    AND m.content != 'message-read'
ORDER BY m.id ASC;
