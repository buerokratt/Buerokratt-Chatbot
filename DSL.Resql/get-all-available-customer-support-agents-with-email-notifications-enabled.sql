SELECT id_code, active, status
FROM customer_support_agent_activity csaa
    INNER JOIN user_profile_settings ups ON ups.user_id = csaa.id_code
WHERE (status = 'online' OR status = 'idle')
  AND ups.new_chat_email_notifications = true
  AND csaa.id IN (SELECT MAX(id) FROM customer_support_agent_activity GROUP BY id_code);