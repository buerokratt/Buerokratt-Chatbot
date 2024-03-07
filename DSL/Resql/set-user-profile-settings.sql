INSERT INTO user_profile_settings (user_id, forwarded_chat_popup_notifications,
                                   forwarded_chat_sound_notifications, forwarded_chat_email_notifications,
                                   new_chat_popup_notifications, new_chat_sound_notifications,
                                   new_chat_email_notifications, use_autocorrect)
VALUES
    (:userId, :forwardedChatPopupNotifications, :forwardedChatSoundNotifications, :forwardedChatEmailNotifications,
    :newChatPopupNotifications, :newChatSoundNotifications, :newChatEmailNotifications, :useAutocorrect)
ON CONFLICT(user_id) DO UPDATE SET forwarded_chat_popup_notifications = :forwardedChatPopupNotifications,
                                   forwarded_chat_sound_notifications = :forwardedChatSoundNotifications,
                                   forwarded_chat_email_notifications = :forwardedChatEmailNotifications,
                                   new_chat_popup_notifications = :newChatPopupNotifications,
                                   new_chat_sound_notifications = :newChatSoundNotifications,
                                   new_chat_email_notifications = :newChatEmailNotifications,
                                   use_autocorrect = :useAutocorrect;
