INSERT INTO auth_users.denormalized_user_data (
    login,
    id_code,
    first_name,
    last_name,
    display_name,
    password_hash,
    user_status,
    authority_name,
    csa_title,
    csa_email,
    department
)
VALUES (
    :userIdCode,
    :userIdCode,
    :firstName,
    :lastName,
    :displayName,
    :displayName,
    :userStatus::user_status,
    ARRAY[:roles],
    :csaTitle,
    :csaEmail,
    :department
);