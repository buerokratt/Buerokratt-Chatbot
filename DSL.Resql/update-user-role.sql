UPDATE user_authority
SET authority_name = ARRAY [ :roles ],
    created = :created::timestamp with time zone
WHERE user_id = :userIdCode
