COPY (
    SELECT *
    FROM chat.denormalized_chat_messages_for_metrics
    WHERE (chat_base_id, timestamp) NOT IN (
        SELECT chat_base_id, max(timestamp)
        FROM chat.denormalized_chat_messages_for_metrics
        GROUP BY chat_base_id
    ) AND timestamp < %(export_boundary)s
) TO stdout WITH csv HEADER;
