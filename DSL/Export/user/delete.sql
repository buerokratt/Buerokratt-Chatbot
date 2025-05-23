DELETE FROM "user"
WHERE (id_code, created) NOT IN (
    SELECT id_code, max(created)
    FROM "user"
    GROUP BY id_code
) AND created < %(export_boundary)s;
