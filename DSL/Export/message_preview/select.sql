COPY (
    SELECT *
    FROM message_preview
    WHERE (chat_base_id, created) NOT IN (
        SELECT chat_base_id, max(created)
        FROM message_preview
        GROUP BY chat_base_id
    ) AND created < %(export_boundary)s
) TO stdout WITH csv HEADER;
