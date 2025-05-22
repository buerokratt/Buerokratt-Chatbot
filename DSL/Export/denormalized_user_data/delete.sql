DELETE FROM denormalized_user_data
WHERE (id_code, created) NOT IN (
    SELECT id_code, max(created)
    FROM denormalized_user_data
    GROUP BY id_code
) AND created < CURRENT_DATE - INTERVAL '2 days';
