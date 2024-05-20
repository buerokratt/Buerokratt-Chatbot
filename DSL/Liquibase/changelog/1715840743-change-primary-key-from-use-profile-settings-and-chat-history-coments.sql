-- liquibase formatted sql
-- changeset baha-a:1715840743

ALTER TABLE chat_history_comments
DROP CONSTRAINT IF EXISTS chat_history_comments_pkey,
ADD CONSTRAINT chat_history_comments_pkey PRIMARY KEY (id);

ALTER TABLE user_profile_settings
DROP CONSTRAINT IF EXISTS user_profile_settings_pkey,
ADD COLUMN id BIGSERIAL NOT NULL PRIMARY KEY;
