-- liquibase formatted sql
-- changeset ahmer-mt:20250522001900 ignore:true
-- liquibase formatted sql
-- changeset ahmer-mt:20250521205758 ignore:true
-- Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Begin transaction to ensure all changes are atomic
BEGIN;

-- Modify chat table
ALTER TABLE chat 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE chat SET uuid_id = gen_random_uuid();
ALTER TABLE chat DROP CONSTRAINT IF EXISTS chat_id_key;
ALTER TABLE chat DROP COLUMN id;
ALTER TABLE chat RENAME COLUMN uuid_id TO id;
ALTER TABLE chat ADD PRIMARY KEY (id);

-- Modify message table
ALTER TABLE message 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE message SET uuid_id = gen_random_uuid();
ALTER TABLE message DROP CONSTRAINT IF EXISTS message_id_key;
ALTER TABLE message DROP COLUMN id;
ALTER TABLE message RENAME COLUMN uuid_id TO id;
ALTER TABLE message ADD PRIMARY KEY (id);

-- Modify chat_history_comments table
ALTER TABLE chat_history_comments 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE chat_history_comments SET uuid_id = gen_random_uuid();
ALTER TABLE chat_history_comments DROP CONSTRAINT IF EXISTS chat_history_comments_pkey;
ALTER TABLE chat_history_comments DROP COLUMN id;
ALTER TABLE chat_history_comments RENAME COLUMN uuid_id TO id;
ALTER TABLE chat_history_comments ADD PRIMARY KEY (id);

-- Modify denormalized_chat table
ALTER TABLE denormalized_chat 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE denormalized_chat SET uuid_id = gen_random_uuid();
ALTER TABLE denormalized_chat DROP CONSTRAINT IF EXISTS denormalized_chat_pkey;
ALTER TABLE denormalized_chat DROP COLUMN id;
ALTER TABLE denormalized_chat RENAME COLUMN uuid_id TO id;
ALTER TABLE denormalized_chat ADD PRIMARY KEY (id);

-- Modify denormalized_user_data table
ALTER TABLE denormalized_user_data 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE denormalized_user_data SET uuid_id = gen_random_uuid();
ALTER TABLE denormalized_user_data DROP CONSTRAINT IF EXISTS denormalized_user_data_pkey;
ALTER TABLE denormalized_user_data DROP COLUMN id;
ALTER TABLE denormalized_user_data RENAME COLUMN uuid_id TO id;
ALTER TABLE denormalized_user_data ADD PRIMARY KEY (id);

-- Modify user table
ALTER TABLE "user" 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE "user" SET uuid_id = gen_random_uuid();
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE "user" DROP COLUMN id;
ALTER TABLE "user" RENAME COLUMN uuid_id TO id;
ALTER TABLE "user" ADD PRIMARY KEY (id);

-- Modify configuration table
ALTER TABLE configuration 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE configuration SET uuid_id = gen_random_uuid();
ALTER TABLE configuration DROP CONSTRAINT IF EXISTS configuration_pkey;
ALTER TABLE configuration DROP COLUMN id;
ALTER TABLE configuration RENAME COLUMN uuid_id TO id;
ALTER TABLE configuration ADD PRIMARY KEY (id);

-- Modify establishment table
ALTER TABLE establishment 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE establishment SET uuid_id = gen_random_uuid();
ALTER TABLE establishment DROP CONSTRAINT IF EXISTS establishment_pkey;
ALTER TABLE establishment DROP COLUMN id;
ALTER TABLE establishment RENAME COLUMN uuid_id TO id;
ALTER TABLE establishment ADD PRIMARY KEY (id);

-- Modify user_page_preferences table
ALTER TABLE user_page_preferences 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE user_page_preferences SET uuid_id = gen_random_uuid();
ALTER TABLE user_page_preferences DROP CONSTRAINT IF EXISTS user_page_preferences_pkey;
ALTER TABLE user_page_preferences DROP COLUMN id;
ALTER TABLE user_page_preferences RENAME COLUMN uuid_id TO id;
ALTER TABLE user_page_preferences ADD PRIMARY KEY (id);


-- Modify message_preview table
ALTER TABLE message_preview
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE message_preview SET uuid_id = gen_random_uuid();
ALTER TABLE message_preview DROP CONSTRAINT IF EXISTS message_preview_pkey;

ALTER TABLE message_preview ADD COLUMN created TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE message_preview
SET created = NOW() - make_interval(secs => (SELECT MAX(id) FROM message_preview) - id);

CREATE INDEX idx_message_preview_chat_base_id_created
ON message_preview(chat_base_id, created DESC);

ALTER TABLE message_preview DROP COLUMN id;
ALTER TABLE message_preview RENAME COLUMN uuid_id TO id;
ALTER TABLE message_preview ADD PRIMARY KEY (id);

-- Modify scheduled_reports table
ALTER TABLE scheduled_reports 
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE scheduled_reports SET uuid_id = gen_random_uuid();
ALTER TABLE scheduled_reports DROP CONSTRAINT IF EXISTS scheduled_reports_id_key;
ALTER TABLE scheduled_reports DROP COLUMN id;
ALTER TABLE scheduled_reports RENAME COLUMN uuid_id TO id;
ALTER TABLE scheduled_reports ADD PRIMARY KEY (id);

-- Modify message_preview table
ALTER TABLE user_overview_metric_preference
  ADD COLUMN uuid_id UUID DEFAULT gen_random_uuid();
UPDATE user_overview_metric_preference SET uuid_id = gen_random_uuid();
ALTER TABLE user_overview_metric_preference DROP CONSTRAINT IF EXISTS user_overview_metric_pkey;

ALTER TABLE user_overview_metric_preference ADD COLUMN created TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE user_overview_metric_preference
SET created = NOW() - make_interval(secs => (SELECT MAX(id) FROM user_overview_metric_preference) - id);

ALTER TABLE user_overview_metric_preference DROP COLUMN id;
ALTER TABLE user_overview_metric_preference RENAME COLUMN uuid_id TO id;
ALTER TABLE user_overview_metric_preference ADD PRIMARY KEY (id);

CREATE INDEX idx_user_overview_metric_user_metric_created_ord 
ON user_overview_metric_preference (user_id_code, metric, created DESC, ordinality);

-- Drop sequences no longer needed
DROP SEQUENCE IF EXISTS chat_id_seq;
DROP SEQUENCE IF EXISTS message_id_seq;
DROP SEQUENCE IF EXISTS chat_history_comments_id_seq;
DROP SEQUENCE IF EXISTS denormalized_chat_id_seq;
DROP SEQUENCE IF EXISTS denormalized_user_data_id_seq;
DROP SEQUENCE IF EXISTS user_id_seq;
DROP SEQUENCE IF EXISTS configuration_id_seq;
DROP SEQUENCE IF EXISTS establishment_id_seq;
DROP SEQUENCE IF EXISTS user_page_preferences_id_seq;
DROP SEQUENCE IF EXISTS message_preview_id_seq;
DROP SEQUENCE IF EXISTS message_preview_id_seq;
DROP SEQUENCE IF EXISTS scheduled_reports_id_seq;

-- Commit all changes
COMMIT;