UPDATE message
SET content = ''
WHERE chat_base_id IN (:chats);

UPDATE chat
SET end_user_id         = NULL,
    end_user_first_name = NULL,
    end_user_last_name  = NULL,
    end_user_email      = NULL,
    end_user_phone      = NULL
WHERE base_id IN (:chats);
