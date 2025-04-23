WITH
    latest_user_record AS (
        SELECT
            login,
            id_code,
            status,
            status_comment,
            csa_created,
            active,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        FROM denorm_user_csa_authority_profile_settings
        WHERE id_code = :userIdCode
        ORDER BY id DESC
        LIMIT 1
    )

INSERT INTO denorm_user_csa_authority_profile_settings (
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    csa_title,
    csa_email,
    department,
    authority_name,
    user_status,
    status,
    status_comment,
    csa_created,
    active,
    forwarded_chat_popup_notifications,
    forwarded_chat_sound_notifications,
    forwarded_chat_email_notifications,
    new_chat_popup_notifications,
    new_chat_sound_notifications,
    new_chat_email_notifications,
    use_autocorrect
)
SELECT
    login,
    :firstName,
    :lastName,
    id_code,
    :displayName,
    :csaTitle,
    :csaEmail,
    :department,
    ARRAY[:roles],
    :userStatus::user_status,
    status,
    status_comment,
    csa_created,
    active,
    forwarded_chat_popup_notifications,
    forwarded_chat_sound_notifications,
    forwarded_chat_email_notifications,
    new_chat_popup_notifications,
    new_chat_sound_notifications,
    new_chat_email_notifications,
    use_autocorrect
FROM latest_user_record;
