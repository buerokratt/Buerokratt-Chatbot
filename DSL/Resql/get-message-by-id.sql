SELECT
    chat_base_id,
    base_id,
    content,
    buttons,
    author_id,
    author_timestamp,
    author_first_name,
    author_last_name,
    author_role,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa,
    created
FROM message
WHERE base_id = :id
ORDER BY updated DESC
    LIMIT 1
