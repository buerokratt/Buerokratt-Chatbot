SELECT m.*
FROM message AS m
JOIN (
    SELECT max(id) AS maxId, base_id
    FROM chat
    GROUP BY base_id
) AS latest_chat ON latest_chat.base_id = m.chat_base_id
JOIN chat AS c ON c.id = latest_chat.maxId
WHERE m.event = 'waiting_validation' AND c.ended IS NULL
