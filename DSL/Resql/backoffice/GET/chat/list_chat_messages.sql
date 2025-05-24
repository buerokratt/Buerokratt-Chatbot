WITH filtered_messages AS (
    SELECT DISTINCT ON (m.base_id)
    *
    FROM chat.message m
    WHERE m.chat_base_id = :chatId
    ORDER BY m.base_id, m.updated DESC
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
    fm.updated
FROM filtered_messages AS fm
ORDER BY fm.created ASC;
