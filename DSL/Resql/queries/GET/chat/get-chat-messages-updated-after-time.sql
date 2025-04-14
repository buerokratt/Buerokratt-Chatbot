WITH
    max_previews AS (
        SELECT MAX(id) AS max_id
        FROM message_preview
        GROUP BY chat_base_id
    ),

    message_previews AS (
        SELECT
            content,
            chat_base_id
        FROM message_preview
            INNER JOIN max_previews ON id = max_id
    ),

    max_messages AS (
        SELECT MAX(id) AS max_id
        FROM message
        WHERE chat_base_id = :chatId
        GROUP BY base_id
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
    m.base_id AS id,
    m.chat_base_id AS chat_id,
    m.content,
    m.buttons,
    m.options,
    m.event,
    m.author_id,
    m.author_timestamp,
    m.author_first_name,
    m.author_last_name,
    m.author_role,
    m.forwarded_by_user,
    m.forwarded_from_csa,
    m.forwarded_to_csa,
    m.original_base_id,
    mp.content AS preview,
    rating,
    m.created,
    updated,
    u.csa_title
FROM message AS m
    LEFT JOIN message_previews AS mp ON m.chat_base_id = mp.chat_base_id
    LEFT JOIN latest_active_user AS u ON m.author_id = u.id_code
    INNER JOIN max_messages ON m.id = max_id
WHERE
    :timeRangeBegin::TIMESTAMP WITH TIME ZONE < m.updated
    AND m.base_id NOT IN (
        SELECT DISTINCT original_base_id
        FROM message
        WHERE original_base_id IS NOT NULL
    )
ORDER BY m.created ASC;
