SELECT
    id_code,
    active,
    status,
    status_comment
FROM denormalized_user_data as d_1
WHERE
    (status = 'online')
    AND created IN (
        SELECT MAX(d_2.created) FROM denormalized_user_data as d_2
        WHERE d_1.id_code = d2.id_code
    );
