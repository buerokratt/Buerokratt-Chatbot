SELECT COUNT(id) AS count
FROM denormalized_user_data
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(d.id) FROM denormalized_user_data AS d
        GROUP BY d.id_code
    );
