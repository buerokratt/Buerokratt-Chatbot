INSERT INTO user_profile_settings (user_id, forwarded_chat_popup_notifications,
                                   forwarded_chat_sound_notifications, forwarded_chat_email_notifications,
                                   new_chat_popup_notifications, new_chat_sound_notifications,
                                   new_chat_email_notifications, use_autocorrect)
VALUES
    (:userId, :forwardedChatPopupNotifications, :forwardedChatSoundNotifications, :forwardedChatEmailNotifications,
    :newChatPopupNotifications, :newChatSoundNotifications, :newChatEmailNotifications, :useAutocorrect);
