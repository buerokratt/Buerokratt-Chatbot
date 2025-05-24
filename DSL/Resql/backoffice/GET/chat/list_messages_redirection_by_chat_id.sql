SELECT
    chat_base_id,
    base_id,
    content,
    event,
    author_id,
    author_timestamp,
    author_first_name,
    author_last_name,
    author_role,
    rating,
    created,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa,
    updated
FROM chat.message AS m1
WHERE base_id = ANY(ARRAY(
    SELECT content::VARCHAR [] AS message_ids
    FROM chat.message
    WHERE
        chat_base_id = :chatId
        AND event = 'requested-chat-forward'
    ORDER BY updated DESC
    LIMIT 1
))
AND updated = (
    SELECT MAX(m2.updated) FROM chat.message AS m2
    WHERE chat_base_id = :chatId and m1.base_id = m2.base_id
);
