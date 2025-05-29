WITH filtered_messages AS (
    SELECT DISTINCT ON (m.base_id)
        m.base_id,
        m.chat_base_id,
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
        m.rating,
        m.created,
        m.updated
    FROM message m
    WHERE m.chat_base_id = :chatId
    ORDER BY m.base_id, m.updated DESC
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
        fm.rating,
        fm.created,
        fm.updated
    FROM filtered_messages AS fm
    WHERE event <> 'greeting' OR event IS NULL
)
SELECT *
FROM (
    SELECT *
    FROM latest_messages
    ORDER BY created DESC
    LIMIT 10 OFFSET 1
) AS limited_messages
ORDER BY created ASC;