SELECT DISTINCT ON (id_code)
                    id_code,
                    display_name
                FROM auth_users."user"
                ORDER BY id_code ASC, created DESC;