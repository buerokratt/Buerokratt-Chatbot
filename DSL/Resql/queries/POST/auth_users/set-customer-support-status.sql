INSERT INTO denorm_user_csa_authority_profile_settings (
    id_code,
    active,
    created,
    status,
    login,
    first_name,
    last_name,
    display_name,
    csa_title,
    csa_email,
    department,
    authority_name,
    user_status,
    new_chat_email_notifications
)
VALUES (
    :userIdCode,
    :active,
    :created::TIMESTAMP WITH TIME ZONE,
    :status::STATUS,
    :login,
    :firstName,
    :lastName,
    :displayName,
    :csaTitle,
    :csaEmail,
    :department,
    :authorityName,
    :userStatus,
    :newChatEmailNotifications
)
