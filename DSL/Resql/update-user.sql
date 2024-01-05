UPDATE "user"
SET first_name = :firstName,
    last_name = :lastName,
    display_name = :displayName,
    status = :status,    
    created = :created::timestamp with time zone, 
    csa_title = :csaTitle,
    csa_email = :csaEmail
WHERE id_code = :userIdCode
