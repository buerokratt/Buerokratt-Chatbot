COPY (
    SELECT id, name, url, base_id, deleted, created
    FROM establishment
    WHERE (base_id, created) NOT IN (
        SELECT base_id, max(created)
        FROM establishment
        GROUP BY base_id
    )
) TO stdout WITH csv HEADER;
