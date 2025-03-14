INSERT INTO user_authority (user_id, authority_name, created)
VALUES (:userIdCode, ARRAY[:roles], :created::TIMESTAMP WITH TIME ZONE);
