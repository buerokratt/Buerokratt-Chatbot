INSERT INTO "user" (
    id_code,
    login,
    password_hash,
    first_name,
    last_name,
    display_name,
    status,
    csa_title,
    csa_email,
    department
)
SELECT
    :userIdCode,
    login,
    password_hash,
    :firstName,
    :lastName,
    :displayName,
    :status::USER_STATUS,
    :csaTitle,
    :csaEmail,
    :department
FROM "user"
WHERE id = (
    SELECT MAX(id) FROM "user"
    WHERE id_code = :userIdCode
);
