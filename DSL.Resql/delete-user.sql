WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO customer_support_agent_activity (id_code, active, created, status)
SELECT :userIdCode, 'false', :created::timestamp with time zone, 'offline'
WHERE (1 < (SELECT COUNT(*) FROM active_administrators)
    OR (1 = (SELECT COUNT(*) FROM active_administrators)
        AND :userIdCode NOT IN (SELECT * FROM active_administrators)));

WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO "user" (login, password_hash, first_name, last_name, id_code, display_name, status, created, csa_title, csa_email)
SELECT login,
       password_hash,
       first_name,
       last_name,
       id_code,
       display_name,
       'deleted',
       :created::timestamp with time zone,
       csa_title,
       csa_email
FROM "user"
WHERE id_code = :userIdCode
  AND status <> 'deleted'
  AND id IN (SELECT max(id) FROM "user" WHERE id_code = :userIdCode)
  AND (1 < (SELECT COUNT(*) FROM active_administrators)
    OR (1 = (SELECT COUNT(*) FROM active_administrators)
        AND :userIdCode NOT IN (SELECT * FROM active_administrators)));

WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO user_authority (user_id, authority_name, created)
SELECT :userIdCode as users, ARRAY []::varchar[], :created::timestamp with time zone
FROM user_authority
WHERE 1 < (SELECT COUNT(*) FROM active_administrators)
   OR (1 = (SELECT COUNT(*) FROM active_administrators)
    AND :userIdCode NOT IN (SELECT * FROM active_administrators))
GROUP BY users;

WITH active_administrators AS (SELECT user_id
                               FROM user_authority
                               WHERE 'ROLE_ADMINISTRATOR' = ANY (authority_name)
                                 AND id IN (SELECT max(id)
                                            FROM user_authority
                                            GROUP BY user_id))
INSERT
INTO user_profile_settings (user_id, forwarded_chat_popup_notifications, forwarded_chat_sound_notifications, forwarded_chat_email_notifications, new_chat_popup_notifications, new_chat_sound_notifications, new_chat_email_notifications, use_autocorrect)
SELECT :userIdCode, false, false, false, false, false, false, false
WHERE 1 < (SELECT COUNT(*) FROM active_administrators)
   OR (1 = (SELECT COUNT(*) FROM active_administrators)
    AND :userIdCode NOT IN (SELECT * FROM active_administrators))
ON CONFLICT (user_id)
DO UPDATE SET user_id = :userIdCode, 
              forwarded_chat_popup_notifications = false,
              forwarded_chat_sound_notifications = false, 
              forwarded_chat_email_notifications = false, 
              new_chat_popup_notifications = false, 
              new_chat_sound_notifications = false, 
              new_chat_email_notifications = false, 
              use_autocorrect = false;
