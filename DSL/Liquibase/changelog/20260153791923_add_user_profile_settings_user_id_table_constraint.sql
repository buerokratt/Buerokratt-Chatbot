-- liquibase formatted sql
-- changeset ahmedyasser:20260153791923
ALTER TABLE user_profile_settings 
DROP CONSTRAINT IF EXISTS user_profile_settings_pkey;

DELETE FROM user_profile_settings
WHERE id NOT IN (
    SELECT MAX(id)
    FROM user_profile_settings
    GROUP BY user_id
);

ALTER TABLE user_profile_settings 
ADD CONSTRAINT user_profile_settings_user_id_key UNIQUE (user_id);
