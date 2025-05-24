SELECT
    id_code,
    active,
    status,
    status_comment
FROM auth_users.denormalized_user_data as d_1
WHERE
    (status = 'online')
    AND created IN (
        SELECT MAX(d_2.created) FROM auth_users.denormalized_user_data as d_2
        WHERE d_1.id_code = d_2.id_code
    );
