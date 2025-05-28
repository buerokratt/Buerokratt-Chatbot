/*
declaration:
  version: 0.1
  description: "Update user notification and autocorrect preferences"
  method: post
  accepts: json
  returns: json
  namespace: auth_users
  allowlist:
    body:
      - field: userId
        type: string
        description: "Unique identifier code of the user"
      - field: forwardedChatPopupNotifications
        type: boolean
        description: "Enable or disable popup notifications for forwarded chats"
      - field: forwardedChatSoundNotifications
        type: boolean
        description: "Enable or disable sound notifications for forwarded chats"
      - field: forwardedChatEmailNotifications
        type: boolean
        description: "Enable or disable email notifications for forwarded chats"
      - field: newChatPopupNotifications
        type: boolean
        description: "Enable or disable popup notifications for new chats"
      - field: newChatSoundNotifications
        type: boolean
        description: "Enable or disable sound notifications for new chats"
      - field: newChatEmailNotifications
        type: boolean
        description: "Enable or disable email notifications for new chats"
      - field: useAutocorrect
        type: boolean
        description: "Enable or disable autocorrect feature"
*/
SELECT copy_row_with_modifications(
    'auth_users.denormalized_user_data',
    'id', '::UUID', id::VARCHAR,
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
FROM auth_users.denormalized_user_data
WHERE id_code = :userId
ORDER BY created DESC
LIMIT 1;
