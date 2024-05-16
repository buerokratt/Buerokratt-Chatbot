SELECT *
FROM user_profile_settings
WHERE user_id=:userId
ORDER BY id DESC
LIMIT 1;
