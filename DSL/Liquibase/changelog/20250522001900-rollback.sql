-- liquibase formatted sql
-- changeset ahmer-mt:20250522001900 ignore:true
-- Begin transaction to ensure all changes are atomic
BEGIN;
-- Recreate sequences for auto-incrementing IDs
CREATE SEQUENCE IF NOT EXISTS chat_id_seq;
CREATE SEQUENCE IF NOT EXISTS message_id_seq;
CREATE SEQUENCE IF NOT EXISTS chat_history_comments_id_seq;
CREATE SEQUENCE IF NOT EXISTS denormalized_chat_id_seq;
CREATE SEQUENCE IF NOT EXISTS denormalized_user_data_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_id_seq;
CREATE SEQUENCE IF NOT EXISTS configuration_id_seq;
CREATE SEQUENCE IF NOT EXISTS establishment_id_seq;
CREATE SEQUENCE IF NOT EXISTS user_page_preferences_id_seq;

-- Rollback chat table
ALTER TABLE chat ADD COLUMN bigint_id BIGINT DEFAULT nextval('chat_id_seq');
UPDATE chat SET bigint_id = nextval('chat_id_seq');
ALTER TABLE chat DROP CONSTRAINT IF EXISTS chat_pkey;
ALTER TABLE chat DROP COLUMN id;
ALTER TABLE chat RENAME COLUMN bigint_id TO id;
ALTER TABLE chat ADD PRIMARY KEY (id);
ALTER TABLE chat ALTER COLUMN id SET DEFAULT nextval('chat_id_seq');

-- Rollback message table
ALTER TABLE message ADD COLUMN bigint_id BIGINT DEFAULT nextval('message_id_seq');
UPDATE message SET bigint_id = nextval('message_id_seq');
ALTER TABLE message DROP CONSTRAINT IF EXISTS message_pkey;
ALTER TABLE message DROP COLUMN id;
ALTER TABLE message RENAME COLUMN bigint_id TO id;
ALTER TABLE message ADD PRIMARY KEY (id);
ALTER TABLE message ALTER COLUMN id SET DEFAULT nextval('message_id_seq');

-- Rollback chat_history_comments table
ALTER TABLE chat_history_comments ADD COLUMN bigint_id BIGINT DEFAULT nextval('chat_history_comments_id_seq');
UPDATE chat_history_comments SET bigint_id = nextval('chat_history_comments_id_seq');
ALTER TABLE chat_history_comments DROP CONSTRAINT IF EXISTS chat_history_comments_pkey;
ALTER TABLE chat_history_comments DROP COLUMN id;
ALTER TABLE chat_history_comments RENAME COLUMN bigint_id TO id;
ALTER TABLE chat_history_comments ADD PRIMARY KEY (id);
ALTER TABLE chat_history_comments ALTER COLUMN id SET DEFAULT nextval('chat_history_comments_id_seq');

-- Rollback denormalized_chat table
ALTER TABLE denormalized_chat ADD COLUMN bigint_id BIGINT DEFAULT nextval('denormalized_chat_id_seq');
UPDATE denormalized_chat SET bigint_id = nextval('denormalized_chat_id_seq');
ALTER TABLE denormalized_chat DROP CONSTRAINT IF EXISTS denormalized_chat_pkey;
ALTER TABLE denormalized_chat DROP COLUMN id;
ALTER TABLE denormalized_chat RENAME COLUMN bigint_id TO id;
ALTER TABLE denormalized_chat ADD PRIMARY KEY (id);
ALTER TABLE denormalized_chat ALTER COLUMN id SET DEFAULT nextval('denormalized_chat_id_seq');

-- Rollback denormalized_user_data table
ALTER TABLE denormalized_user_data ADD COLUMN bigint_id BIGINT DEFAULT nextval('denormalized_user_data_id_seq');
UPDATE denormalized_user_data SET bigint_id = nextval('denormalized_user_data_id_seq');
ALTER TABLE denormalized_user_data DROP CONSTRAINT IF EXISTS denormalized_user_data_pkey;
ALTER TABLE denormalized_user_data DROP COLUMN id;
ALTER TABLE denormalized_user_data RENAME COLUMN bigint_id TO id;
ALTER TABLE denormalized_user_data ADD PRIMARY KEY (id);
ALTER TABLE denormalized_user_data ALTER COLUMN id SET DEFAULT nextval('denormalized_user_data_id_seq');

-- Rollback user table
ALTER TABLE "user" ADD COLUMN bigint_id BIGINT DEFAULT nextval('user_id_seq');
UPDATE "user" SET bigint_id = nextval('user_id_seq');
ALTER TABLE "user" DROP CONSTRAINT IF EXISTS user_pkey;
ALTER TABLE "user" DROP COLUMN id;
ALTER TABLE "user" RENAME COLUMN bigint_id TO id;
ALTER TABLE "user" ADD PRIMARY KEY (id);
ALTER TABLE "user" ALTER COLUMN id SET DEFAULT nextval('user_id_seq');

-- Rollback configuration table
ALTER TABLE configuration ADD COLUMN bigint_id BIGINT DEFAULT nextval('configuration_id_seq');
UPDATE configuration SET bigint_id = nextval('configuration_id_seq');
ALTER TABLE configuration DROP CONSTRAINT IF EXISTS configuration_pkey;
ALTER TABLE configuration DROP COLUMN id;
ALTER TABLE configuration RENAME COLUMN bigint_id TO id;
ALTER TABLE configuration ADD PRIMARY KEY (id);
ALTER TABLE configuration ALTER COLUMN id SET DEFAULT nextval('configuration_id_seq');

-- Rollback establishment table
ALTER TABLE establishment ADD COLUMN bigint_id BIGINT DEFAULT nextval('establishment_id_seq');
UPDATE establishment SET bigint_id = nextval('establishment_id_seq');
ALTER TABLE establishment DROP CONSTRAINT IF EXISTS establishment_pkey;
ALTER TABLE establishment DROP COLUMN id;
ALTER TABLE establishment RENAME COLUMN bigint_id TO id;
ALTER TABLE establishment ADD PRIMARY KEY (id);
ALTER TABLE establishment ALTER COLUMN id SET DEFAULT nextval('establishment_id_seq');

-- Rollback user_page_preferences table
ALTER TABLE user_page_preferences ADD COLUMN bigint_id BIGINT DEFAULT nextval('user_page_preferences_id_seq');
UPDATE user_page_preferences SET bigint_id = nextval('user_page_preferences_id_seq');
ALTER TABLE user_page_preferences DROP CONSTRAINT IF EXISTS user_page_preferences_pkey;
ALTER TABLE user_page_preferences DROP COLUMN id;
ALTER TABLE user_page_preferences RENAME COLUMN bigint_id TO id;
ALTER TABLE user_page_preferences ADD PRIMARY KEY (id);
ALTER TABLE user_page_preferences ALTER COLUMN id SET DEFAULT nextval('user_page_preferences_id_seq');

-- Set sequence values to appropriate values to avoid conflicts
-- This gets the max ID from each table and sets the sequence to start after that max value
SELECT setval('chat_id_seq', COALESCE((SELECT MAX(id) FROM chat), 0) + 1, false);
SELECT setval('message_id_seq', COALESCE((SELECT MAX(id) FROM message), 0) + 1, false);
SELECT setval('chat_history_comments_id_seq', COALESCE((SELECT MAX(id) FROM chat_history_comments), 0) + 1, false);
SELECT setval('denormalized_chat_id_seq', COALESCE((SELECT MAX(id) FROM denormalized_chat), 0) + 1, false);
SELECT setval('denormalized_user_data_id_seq', COALESCE((SELECT MAX(id) FROM denormalized_user_data), 0) + 1, false);
SELECT setval('user_id_seq', COALESCE((SELECT MAX(id) FROM "user"), 0) + 1, false);
SELECT setval('configuration_id_seq', COALESCE((SELECT MAX(id) FROM configuration), 0) + 1, false);
SELECT setval('establishment_id_seq', COALESCE((SELECT MAX(id) FROM establishment), 0) + 1, false);
SELECT setval('user_page_preferences_id_seq', COALESCE((SELECT MAX(id) FROM user_page_preferences), 0) + 1, false);

-- Commit all changes
COMMIT;