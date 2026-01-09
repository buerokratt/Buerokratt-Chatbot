-- liquibase formatted sql
-- changeset ahmedyasser:20260153791922
ALTER TABLE user_profile_settings 
DROP CONSTRAINT IF EXISTS user_profile_settings_pkey;

ALTER TABLE user_profile_settings 
ADD CONSTRAINT user_profile_settings_user_id_key UNIQUE (user_id);
