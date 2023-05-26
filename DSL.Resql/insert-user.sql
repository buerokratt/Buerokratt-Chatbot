INSERT INTO "user" (login, display_name, password_hash, id_code, status, created, csa_title, csa_email)
VALUES (:userIdCode, :displayName, :displayName, :userIdCode, :status, :created::timestamp with time zone, :csaTitle, :csa_email);
