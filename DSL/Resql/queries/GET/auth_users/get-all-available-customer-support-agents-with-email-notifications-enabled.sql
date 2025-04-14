SELECT
    id_code,
    active,
    status
FROM denorm_user_csa_authority_profile_settings
WHERE
    (status = 'online' OR status = 'idle')
    AND new_chat_email_notifications = true
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        GROUP BY id_code
    );
