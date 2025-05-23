DELETE FROM chat
WHERE (base_id, updated) NOT IN (
    SELECT base_id, max(updated)
    FROM chat
    GROUP BY base_id
) AND updated < %(export_boundary)s;
