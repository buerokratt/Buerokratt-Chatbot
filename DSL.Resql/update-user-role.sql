UPDATE user_authority
SET user_id = :userIdCode,
    authority_name = ARRAY [ :roles ],
    created = :created::timestamp with time zone
WHERE user_id = :userIdCode
