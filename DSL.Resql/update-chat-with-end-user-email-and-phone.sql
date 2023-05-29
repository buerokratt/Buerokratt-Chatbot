UPDATE chat
SET end_user_email = :endUserEmail, end_user_phone = :endUserPhone
WHERE base_id = :chatId;
