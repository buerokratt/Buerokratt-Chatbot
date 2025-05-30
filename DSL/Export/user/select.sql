COPY (
    SELECT *
    FROM auth_users."user"
    WHERE (id_code, created) NOT IN (
        SELECT id_code, max(created)
        FROM auth_users."user"
        GROUP BY id_code
    ) AND created < %(export_boundary)s
) TO stdout WITH csv HEADER;
