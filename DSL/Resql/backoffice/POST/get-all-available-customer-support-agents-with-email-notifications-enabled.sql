WITH MaxUserProfileSettings AS (
  SELECT MAX(id) AS maxId
  FROM user_profile_settings
  GROUP BY user_id
),
UserProfileSettings AS (
  SELECT user_id, new_chat_email_notifications
  FROM user_profile_settings
  JOIN MaxUserProfileSettings ON id = maxId
)
SELECT id_code, active, status
FROM customer_support_agent_activity csaa
    INNER JOIN UserProfileSettings ups ON ups.user_id = csaa.id_code
WHERE (status = 'online' OR status = 'idle')
  AND ups.new_chat_email_notifications
  AND csaa.id IN (SELECT MAX(id) FROM customer_support_agent_activity GROUP BY id_code);
