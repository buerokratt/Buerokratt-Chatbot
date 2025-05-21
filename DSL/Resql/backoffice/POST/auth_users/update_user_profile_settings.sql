SELECT copy_row_with_modifications(
    'denorm_user_csa_authority_profile_settings',
    'id', '::INTEGER', id::VARCHAR,
    ARRAY[
        'forwarded_chat_popup_notifications', '', :forwardedChatPopupNotifications,
        'forwarded_chat_sound_notifications', '', :forwardedChatSoundNotifications,
        'forwarded_chat_email_notifications', '', :forwardedChatEmailNotifications,
        'new_chat_popup_notifications', '', :newChatPopupNotifications,
        'new_chat_sound_notifications', '', :newChatSoundNotifications,
        'new_chat_email_notifications', '', :newChatEmailNotifications,
        'use_autocorrect', '', :useAutocorrect,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)
FROM denorm_user_csa_authority_profile_settings
WHERE id_code = :userId
ORDER BY id DESC
LIMIT 1;
