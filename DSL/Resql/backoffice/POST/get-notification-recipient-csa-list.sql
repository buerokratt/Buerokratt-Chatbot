SELECT DISTINCT u.id_code
FROM "user" AS u
JOIN user_authority AS ua
  ON ua.user_id = u.id_code
WHERE u.status <> 'deleted'
  AND u.id IN (
    SELECT MAX(id)
    FROM "user"
    GROUP BY id_code
  )
  AND ua.id IN (
    SELECT MAX(id)
    FROM user_authority
    GROUP BY user_id
  )
       AND ua.authority_name && ARRAY[
         'ROLE_ADMINISTRATOR',
         'ROLE_CUSTOMER_SUPPORT_AGENT',
         'ROLE_SERVICE_MANAGER',
         'ROLE_CHATBOT_TRAINER',
         'ROLE_ANALYST'
       ]::varchar[]
ORDER BY u.id_code;
