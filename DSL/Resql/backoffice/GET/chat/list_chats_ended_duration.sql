SELECT
    SUM(chat_duration_in_seconds) AS duration_in_seconds
FROM (
    SELECT DISTINCT ON (chat_id)
        chat_id,
        chat_duration_in_seconds,
        ended,
        customer_support_id,
    FROM denormalized_chat
    ORDER BY chat_id, id DESC
) latest_chats
WHERE
    ended IS NOT NULL
    AND ended > (NOW() - '1 month'::INTERVAL)
    AND customer_support_id <> ''
    AND customer_support_id <> :bot_institution_id;