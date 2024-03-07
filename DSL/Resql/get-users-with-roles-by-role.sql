SELECT DISTINCT u.login,
       u.first_name,
       u.last_name,
       u.id_code,
       u.display_name,
       u.csa_title,
       u.csa_email,
       ua.authority_name AS authorities,
       csa.status AS customer_support_status
FROM "user" u
LEFT JOIN (
    SELECT authority_name, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id DESC) AS rn
    FROM user_authority AS ua
    WHERE authority_name && ARRAY [ :roles ]::character varying array
      AND ua.id IN (
          SELECT max(id)
          FROM user_authority
          GROUP BY user_id
      )
) ua ON u.id_code = ua.user_id
JOIN (
    SELECT id_code, status, ROW_NUMBER() OVER (PARTITION BY id_code ORDER BY id DESC) AS rn
    FROM customer_support_agent_activity
) csa ON u.id_code = csa.id_code AND csa.rn = 1
WHERE u.status <> 'deleted'
  AND array_length(authority_name, 1) > 0
  AND u.id IN (
      SELECT max(id)
      FROM "user"
      GROUP BY id_code
  );
