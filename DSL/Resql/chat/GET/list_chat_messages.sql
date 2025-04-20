WITH filtered_messages AS (
    SELECT DISTINCT ON (m.base_id)
    *
    FROM message m
    WHERE m.chat_base_id = :chatId
    ORDER BY m.base_id, m.updated DESC
),
    latest_active_user AS (
        SELECT
            u.id_code,
            u.created,
            u.csa_title
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
    fm.base_id AS id,
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
    fm.rating,
    fm.created,
    fm.updated,
    u.csa_title
FROM filtered_messages AS fm
    LEFT JOIN latest_active_user AS u ON fm.author_id = u.id_code
ORDER BY fm.created ASC;
