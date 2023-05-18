SELECT DISTINCT u.login,
       u.first_name,
       u.last_name,
       u.id_code,
       u.display_name,
       u.csa_title,
       u.csa_email,
       ua.authority_name AS authorities,
       last_value(csa.status)
       OVER(
        PARTITION BY csa.id_code
       ) AS customer_support_status
FROM "user" u
         LEFT JOIN (SELECT authority_name, user_id
                    FROM user_authority AS ua
                    WHERE authority_name && ARRAY [ :roles ]::character varying array
                      AND ua.id IN (SELECT max(id)
                                    FROM user_authority
                                    GROUP BY user_id)) ua ON u.id_code = ua.user_id
         JOIN customer_support_agent_activity as csa on u.id_code = csa.id_code
WHERE u.status <> 'deleted'
  AND array_length(authority_name, 1) > 0
  AND u.id IN (SELECT max(id) FROM "user" GROUP BY id_code)
