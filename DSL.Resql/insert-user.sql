INSERT INTO "user" (login, display_name, password_hash, id_code, status, created)
VALUES (:displayName, :displayName, :displayName, :userIdCode, :status, :created::timestamp with time zone);