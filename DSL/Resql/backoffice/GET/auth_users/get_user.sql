SELECT id_code
FROM "user"
WHERE
    id_code = :userIdCode
    AND created = (
        SELECT MAX(created) FROM "user"
        WHERE id_code = :userIdCode
    ) 
    AND status <> 'deleted'
