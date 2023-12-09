INSERT INTO "user" (login, first_name, last_name, display_name, password_hash, id_code, status, created, csa_title, csa_email)
VALUES (:userIdCode, :first_name, :last_name, :displayName, :displayName, :userIdCode, :status, :created::timestamp with time zone, :csaTitle, :csa_email);
