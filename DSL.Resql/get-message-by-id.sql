SELECT chat_base_id, base_id, content, author_id, author_timestamp, author_first_name, author_last_name, author_role, created
FROM message
WHERE base_id = :id
ORDER BY updated DESC
    LIMIT 1