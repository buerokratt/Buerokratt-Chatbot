WITH initial_user AS (
    INSERT INTO "user" (login, id_code, first_name, last_name, display_name, status, created, csa_title, csa_email)
        SELECT :userIdCode, :userIdCode, :firstName, :lastName, :firstName, 'active', :created::timestamp with time zone, null, null
        WHERE NOT exists(SELECT 1 FROM "user")
        RETURNING id_code),
     initial_user_authority AS (
         INSERT INTO user_authority (user_id, authority_name, created)
             SELECT id_code, ARRAY [ :initialUserRole ], :created::timestamp with time zone FROM initial_user
             RETURNING user_id),
     existing_user AS (
         SELECT login, password_hash, display_name, status, first_name, last_name, id_code, csa_title, csa_email
         FROM "user"
         WHERE id_code = :userIdCode
           AND id IN (SELECT max(id) FROM "user" WHERE status <> 'deleted' GROUP BY id_code)
     )
SELECT :userIdCode AS user_id_code
WHERE (SELECT user_id FROM initial_user_authority) IS NOT NULL
   OR (SELECT id_code FROM existing_user) IS NOT NULL;
