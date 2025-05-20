SELECT
    id_code AS user_id,
    forwarded_chat_popup_notifications,
    forwarded_chat_sound_notifications,
    forwarded_chat_email_notifications,
    new_chat_popup_notifications,
    new_chat_sound_notifications,
    new_chat_email_notifications,
    use_autocorrect
FROM denormalized_user_data
WHERE id_code = :userId
ORDER BY created DESC
LIMIT 1;
