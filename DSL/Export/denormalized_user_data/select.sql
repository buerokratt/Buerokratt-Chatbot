COPY (
    SELECT *
    FROM auth_users.denormalized_user_data
    WHERE (id_code, created) NOT IN (
        SELECT id_code, max(created)
        FROM auth_users.denormalized_user_data
        GROUP BY id_code
    ) AND created < %(export_boundary)s
) TO stdout WITH csv HEADER;
