SELECT
    id_code,
    active,
    status,
    status_comment
FROM denormalized_user_data
WHERE
    (status = 'online')
    AND id IN (
        SELECT MAX(id) FROM denormalized_user_data
        GROUP BY id_code
    );
