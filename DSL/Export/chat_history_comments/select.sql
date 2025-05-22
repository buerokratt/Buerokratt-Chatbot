COPY (
    SELECT *
    FROM chat_history_comments
    WHERE (chat_id, created) NOT IN (
        SELECT chat_id, max(created)
        FROM chat_history_comments
        GROUP BY chat_id
    ) AND created < CURRENT_DATE - INTERVAL '1 day'
) TO stdout WITH csv HEADER;
