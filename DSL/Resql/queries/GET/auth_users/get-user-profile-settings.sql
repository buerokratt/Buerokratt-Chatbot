SELECT 
  user_id,
  forwarded_chat_popup_notifications,
  forwarded_chat_sound_notifications,
  forwarded_chat_email_notifications,
  new_chat_popup_notifications,
  new_chat_sound_notifications,
  new_chat_email_notifications,
  use_autocorrect
FROM user_profile_settings
WHERE user_id=:userId
ORDER BY id DESC
LIMIT 1;
