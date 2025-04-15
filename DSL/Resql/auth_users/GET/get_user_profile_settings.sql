SELECT
    id_code AS user_id,
    forwarded_chat_popup_notifications,
    forwarded_chat_sound_notifications,
    forwarded_chat_email_notifications,
    new_chat_popup_notifications,
    new_chat_sound_notifications,
    new_chat_email_notifications,
    use_autocorrect
FROM denorm_user_csa_authority_profile_settings
WHERE id_code = :userId
ORDER BY created DESC
LIMIT 1;
