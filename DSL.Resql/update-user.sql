UPDATE "user"
SET login = :userIdCode,
    display_name = :displayName,
    password_hash = :displayName, 
    id_code = :userIdCode,
    status = :status,    
    created = :created::timestamp with time zone, 
    csa_title = :csaTitle,
    csa_email = :csa_email
WHERE id_code = :userIdCode
