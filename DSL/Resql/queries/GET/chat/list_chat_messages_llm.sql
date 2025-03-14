WITH RECURSIVE
    message_chain AS (
        SELECT m.*
        FROM message AS m
        WHERE m.chat_base_id = :chatId
        UNION ALL
        SELECT m.*
        FROM message AS m
            INNER JOIN message_chain AS mc ON m.original_base_id = mc.base_id
    ),

    filtered_messages AS (
        SELECT DISTINCT ON (mc.base_id) mc.*
        FROM message_chain AS mc
            LEFT JOIN message_chain AS mc_2 ON mc.base_id = mc_2.original_base_id
        WHERE mc_2.base_id IS NULL
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
    ),

    latest_messages AS (
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
            fm.original_base_id,
            fm.rating,
            fm.created,
            fm.updated,
            u.csa_title
        FROM filtered_messages AS fm
            LEFT JOIN latest_active_user AS u ON fm.author_id = u.id_code
        WHERE event <> 'greeting' OR event IS NULL
    )

SELECT *
FROM (
    SELECT *
    FROM latest_messages
    ORDER BY created DESC
    LIMIT
        10
        OFFSET 1
) AS limited_messages
ORDER BY created ASC
