UPDATE chat
SET end_user_id = :endUserId, end_user_first_name = :endUserFirstName, end_user_last_name = :endUserLastName
WHERE base_id = :chatId;
