COPY (
    SELECT *
    FROM "user"
    WHERE (id_code, created) NOT IN (
        SELECT id_code, max(created)
        FROM "user"
        GROUP BY id_code
    ) AND created < CURRENT_DATE - INTERVAL '1 day'
) TO stdout WITH csv HEADER;
