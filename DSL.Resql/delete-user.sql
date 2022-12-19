WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO customer_support_agent_activity (id_code, active, created)
SELECT :userIdCode, 'false', :created::timestamp with time zone
WHERE (1 < (SELECT COUNT(*) FROM active_administrators)
    OR (1 = (SELECT COUNT(*) FROM active_administrators)
        AND :userIdCode NOT IN (SELECT * FROM active_administrators)));

WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO "user" (login, password_hash, first_name, last_name, id_code, display_name, status, created, csa_title, csa_email)
SELECT login,
       password_hash,
       first_name,
       last_name,
       id_code,
       display_name,
       'deleted',
       :created::timestamp with time zone,
       csa_title,
       csa_email
FROM "user"
WHERE id_code = :userIdCode
  AND status <> 'deleted'
  AND id IN (SELECT max(id) FROM "user" WHERE id_code = :userIdCode)
  AND (1 < (SELECT COUNT(*) FROM active_administrators)
    OR (1 = (SELECT COUNT(*) FROM active_administrators)
        AND :userIdCode NOT IN (SELECT * FROM active_administrators)));

WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO user_authority (user_id, authority_name, created)
SELECT :userIdCode, ARRAY []::varchar[], :created::timestamp with time zone
FROM user_authority
WHERE 1 < (SELECT COUNT(*) FROM active_administrators)
   OR (1 = (SELECT COUNT(*) FROM active_administrators)
    AND :userIdCode NOT IN (SELECT * FROM active_administrators));