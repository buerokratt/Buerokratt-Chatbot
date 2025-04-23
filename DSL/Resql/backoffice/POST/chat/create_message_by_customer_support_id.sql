INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    event,
    author_id,
    author_first_name,
    author_last_name, author_role, rating
)
SELECT
    chat_base_id,
    (SELECT UUID_IN(MD5(RANDOM()::TEXT)::CSTRING)),
    :content,
    :event,
    :authorId,
    author_first_name,
    author_last_name,
    :authorRole,
    rating
FROM message
WHERE
    chat_base_id IN (
        SELECT base_id
        FROM chat
        WHERE
            id IN (
                SELECT MAX(id) FROM chat
                GROUP BY base_id
            )
            AND customer_support_id = :customerSupportId
            AND ended IS null
    )
    AND id IN (
        SELECT MAX(id) FROM message
        GROUP BY chat_base_id
    )
RETURNING id, chat_base_id, base_id;
