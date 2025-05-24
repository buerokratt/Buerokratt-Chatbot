SELECT csa_email
FROM auth_users."user" as u_1
WHERE
    id_code = ANY(STRING_TO_ARRAY(:customerSupportIds, ','))
    AND created = (
        SELECT MAX(u_2.created) FROM auth_users."user" as u_2
        WHERE u_1.id_code = u_2.id_code
    )
    AND status <> 'deleted'
