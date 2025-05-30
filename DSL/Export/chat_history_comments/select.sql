COPY (
    SELECT *
    FROM chat.chat_history_comments
    WHERE (chat_id, created) NOT IN (
        SELECT chat_id, max(created)
        FROM chat.chat_history_comments
        GROUP BY chat_id
    ) AND created < %(export_boundary)s
) TO stdout WITH csv HEADER;
