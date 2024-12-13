SELECT m.base_id as id, m.chat_base_id as chat_id, m.content, m.created
FROM message AS m
JOIN (
    SELECT max(id) AS maxId, base_id
    FROM chat
    GROUP BY base_id
) AS latest_chat ON latest_chat.base_id = m.chat_base_id
JOIN chat AS c ON c.id = latest_chat.maxId
WHERE m.id = (
    SELECT max(id)
    FROM message
    WHERE chat_base_id = m.chat_base_id
)
AND m.event = 'waiting_validation' AND c.ended IS NULL;
