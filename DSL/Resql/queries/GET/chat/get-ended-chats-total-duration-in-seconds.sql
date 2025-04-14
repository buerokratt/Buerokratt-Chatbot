SELECT
    SUM(chat_duration_in_seconds) AS duration_in_seconds
FROM (
    SELECT DISTINCT ON (chat_id)
        chat_id,
        chat_duration_in_seconds
    FROM denormalized_chat
    WHERE
        ended IS NOT NULL
        AND ended > (NOW() - '1 month'::INTERVAL)
        AND customer_support_id <> ''
        AND is_bot = FALSE
    ORDER BY chat_id, id DESC
) latest_chats;
