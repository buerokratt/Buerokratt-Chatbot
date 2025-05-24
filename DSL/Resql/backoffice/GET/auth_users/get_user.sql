SELECT id_code
FROM auth_users."user"
WHERE
    id_code = :userIdCode
    AND created = (
        SELECT MAX(created) FROM auth_users."user"
        WHERE id_code = :userIdCode
    ) 
    AND status <> 'deleted'
