SELECT u.login,
       u.first_name,
       u.last_name,
       u.id_code,
       u.display_name,
       ua.authority_name AS authorities
FROM "user" u
         INNER JOIN (SELECT authority_name, user_id
                     FROM user_authority AS ua
                     WHERE ua.id IN (SELECT max(id)
                                     FROM user_authority
                                     GROUP BY user_id)) ua ON u.id_code = ua.user_id
WHERE login = :login
  AND password_hash = :password
  AND array_length(authority_name, 1) > 0;
