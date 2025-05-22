COPY (
    SELECT *
    FROM chat
    WHERE (base_id, updated) NOT IN (
        SELECT base_id, max(updated)
        FROM chat
        GROUP BY base_id
    ) AND updated < CURRENT_DATE - INTERVAL '1 day'
) TO stdout WITH csv HEADER;
