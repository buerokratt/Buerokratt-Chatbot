COPY (
    SELECT *
    FROM denormalized_chat
    WHERE (chat_id, denormalized_record_created) NOT IN (
        SELECT chat_id, max(denormalized_record_created)
        FROM denormalized_chat
        GROUP BY chat_id
    ) AND denormalized_record_created < CURRENT_DATE - INTERVAL '1 day'
) TO stdout WITH csv HEADER;
