-- liquibase formatted sql
-- changeset athar-mt:20250528235814 ignore:true

BEGIN;

-- 1. Move tables back to public schema
-- auth_users schema
ALTER TABLE IF EXISTS auth_users.denormalized_user_data SET SCHEMA public;
ALTER TABLE IF EXISTS auth_users."user" SET SCHEMA public;
ALTER TABLE IF EXISTS auth_users.user_page_preferences SET SCHEMA public;

-- chat schema
ALTER TABLE IF EXISTS chat.denormalized_chat SET SCHEMA public;
ALTER TABLE IF EXISTS chat.chat_history_comments SET SCHEMA public;
ALTER TABLE IF EXISTS chat.chat SET SCHEMA public;
ALTER TABLE IF EXISTS chat.message_preview SET SCHEMA public;
ALTER TABLE IF EXISTS chat.message SET SCHEMA public;
ALTER TABLE IF EXISTS chat.denormalized_chat_messages_for_metrics SET SCHEMA public;

-- config schema
ALTER TABLE IF EXISTS config.configuration SET SCHEMA public;

-- org schema
ALTER TABLE IF EXISTS org.establishment SET SCHEMA public;

-- security schema
ALTER TABLE IF EXISTS security.request_nonces SET SCHEMA public;

-- 2. Drop schemas if empty
DROP SCHEMA IF EXISTS auth_users;
DROP SCHEMA IF EXISTS chat;
DROP SCHEMA IF EXISTS config;
DROP SCHEMA IF EXISTS org;
DROP SCHEMA IF EXISTS security;

COMMIT;
