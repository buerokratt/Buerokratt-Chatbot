DELETE FROM message
WHERE (base_id, updated) NOT IN (
    SELECT base_id, max(updated)
    FROM message
    GROUP BY base_id
) AND updated < %(export_boundary)s;
