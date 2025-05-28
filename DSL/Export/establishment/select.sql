COPY (
    SELECT *
    FROM org.establishment
    WHERE (base_id, created) NOT IN (
        SELECT base_id, max(created)
        FROM org.establishment
        GROUP BY base_id
    ) AND created < %(export_boundary)s
) TO stdout WITH csv HEADER;
