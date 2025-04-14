WITH
    max_user_profile_settings AS (
        SELECT MAX(id) AS max_id
        FROM user_profile_settings
        GROUP BY user_id
    ),

    user_profile_settings AS (
        SELECT
            user_id,
            new_chat_email_notifications
        FROM user_profile_settings
            INNER JOIN max_user_profile_settings ON id = max_id
    )

SELECT
    id_code,
    active,
    status
FROM customer_support_agent_activity AS csaa
    INNER JOIN user_profile_settings AS ups ON csaa.id_code = ups.user_id
WHERE
    (status = 'online' OR status = 'idle')
    AND ups.new_chat_email_notifications
    AND csaa.id IN (
        SELECT MAX(id) FROM customer_support_agent_activity
        GROUP BY id_code
    );
