SELECT authority_name AS authorities
FROM denormalized_user_data
WHERE
    id_code = :userIdCode
    AND user_status <> 'deleted'
ORDER BY created DESC
LIMIT 1;
