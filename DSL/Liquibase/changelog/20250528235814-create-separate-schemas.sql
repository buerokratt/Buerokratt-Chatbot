-- liquibase formatted sql
-- changeset athar-mt:20250528235814 ignore:true

-- 1. Create schemas
CREATE SCHEMA IF NOT EXISTS auth_users;
CREATE SCHEMA IF NOT EXISTS chat;
CREATE SCHEMA IF NOT EXISTS config;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS analytics;

-- 2. Move tables to their respective schemas
-- auth_users schema
ALTER TABLE IF EXISTS public.denormalized_user_data SET SCHEMA auth_users;
ALTER TABLE IF EXISTS public."user" SET SCHEMA auth_users;
ALTER TABLE IF EXISTS public.user_overview_metric_preference SET SCHEMA auth_users;
ALTER TABLE IF EXISTS public.user_page_preferences SET SCHEMA auth_users;

-- chat schema
ALTER TABLE IF EXISTS public.chat SET SCHEMA chat;
ALTER TABLE IF EXISTS public.chat_history_comments SET SCHEMA chat;
ALTER TABLE IF EXISTS public.chat_jira_syncrhonization SET SCHEMA chat;
ALTER TABLE IF EXISTS public.chat_smax_syncrhonization SET SCHEMA chat;
ALTER TABLE IF EXISTS public.denormalized_chat SET SCHEMA chat;
ALTER TABLE IF EXISTS public.denormalized_chat_messages_for_metrics SET SCHEMA chat;
ALTER TABLE IF EXISTS public.message SET SCHEMA chat;
ALTER TABLE IF EXISTS public.message_preview SET SCHEMA chat;

-- config schema
ALTER TABLE IF EXISTS public.allowed_statuses SET SCHEMA config;
ALTER TABLE IF EXISTS public.configuration SET SCHEMA config;
ALTER TABLE IF EXISTS public.authority SET SCHEMA config;


-- org schema
ALTER TABLE IF EXISTS public.establishment SET SCHEMA org;

-- analytics schema
ALTER TABLE IF EXISTS public.scheduled_reports SET SCHEMA analytics;
