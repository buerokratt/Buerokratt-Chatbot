SELECT
    id_code,
    active,
    status
FROM auth_users.denormalized_user_data
WHERE
    id_code = :customerSupportId
ORDER BY created DESC
LIMIT 1;
