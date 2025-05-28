-- liquibase formatted sql
-- changeset athar-mt:20250528235814 ignore:true

-- 1. Create schemas
CREATE SCHEMA IF NOT EXISTS auth_users;
CREATE SCHEMA IF NOT EXISTS chat;
CREATE SCHEMA IF NOT EXISTS config;
CREATE SCHEMA IF NOT EXISTS org;
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS analytics;

-- 2. Move tables to their respective schemas
-- auth_users schema
ALTER TABLE IF EXISTS public.denormalized_user_data SET SCHEMA auth_users;
ALTER TABLE IF EXISTS public."user" SET SCHEMA auth_users;
ALTER TABLE IF EXISTS public.user_page_preferences SET SCHEMA auth_users;

-- chat schema
ALTER TABLE IF EXISTS public.denormalized_chat SET SCHEMA chat;
ALTER TABLE IF EXISTS public.chat_history_comments SET SCHEMA chat;
ALTER TABLE IF EXISTS public.chat SET SCHEMA chat;
ALTER TABLE IF EXISTS public.message_preview SET SCHEMA chat;
ALTER TABLE IF EXISTS public.message SET SCHEMA chat;
ALTER TABLE IF EXISTS public.denormalized_chat_messages_for_metrics SET SCHEMA chat;

-- config schema
ALTER TABLE IF EXISTS public.configuration SET SCHEMA config;

-- org schema
ALTER TABLE IF EXISTS public.establishment SET SCHEMA org;

-- security schema
ALTER TABLE IF EXISTS public.request_nonces SET SCHEMA security;

-- analytics schema
ALTER TABLE IF EXISTS public.scheduled_reports SET SCHEMA analytics;

-- service_management schema
ALTER TABLE IF EXISTS public.service_trigger SET SCHEMA service_management;

DO $$
DECLARE
    idx_record RECORD;
    config_tables TEXT[] := ARRAY['allowed_statuses', 'authority', 'configuration'];
    chat_tables TEXT[] := ARRAY['chat', 'chat_history_comments', 'chat_jira_syncrhonization', 
                               'chat_smax_syncrhonization', 'denormalized_chat', 
                               'denormalized_chat_messages_for_metrics', 'message', 'message_preview'];
    auth_users_tables TEXT[] := ARRAY['denormalized_user_data', 'user', 
                                     'user_overview_metric_preference', 'user_page_preference'];
    org_tables TEXT[] := ARRAY['establishment'];
    security_tables TEXT[] := ARRAY['request_nonces'];
    analytics_tables TEXT[] := ARRAY['scheduled_reports'];
    service_management_tables TEXT[] := ARRAY['service_trigger'];
    target_schema TEXT;
BEGIN
    FOR idx_record IN 
        SELECT 
            t.relname AS table_name,
            indexrelid::regclass AS idx_name,
            idx_ns.nspname AS current_schema
        FROM pg_index i
        JOIN pg_class t ON i.indrelid = t.oid
        JOIN pg_namespace n ON t.relnamespace = n.oid
        JOIN pg_class idx ON i.indexrelid = idx.oid
        JOIN pg_namespace idx_ns ON idx.relnamespace = idx_ns.oid
        WHERE t.relname = ANY(config_tables || chat_tables || auth_users_tables || org_tables || security_tables || analytics_tables || service_management_tables)
        AND n.nspname = 'public'  -- Current schema of the tables
    LOOP
        -- Determine target schema based on which array the table is in
        IF idx_record.table_name = ANY(config_tables) THEN
            target_schema := 'config';
        ELSIF idx_record.table_name = ANY(chat_tables) THEN
            target_schema := 'chat';
        ELSIF idx_record.table_name = ANY(auth_users_tables) THEN
            target_schema := 'auth_users';
        ELSIF idx_record.table_name = ANY(org_tables) THEN
            target_schema := 'org';
        ELSIF idx_record.table_name = ANY(security_tables) THEN
            target_schema := 'security';
        ELSIF idx_record.table_name = ANY(analytics_tables) THEN
            target_schema := 'analytics';
        ELSIF idx_record.table_name = ANY(service_management_tables) THEN
            target_schema := 'service_management';
        ELSE
            target_schema := NULL; -- Should not happen with our WHERE clause
        END IF;

        IF target_schema IS NULL THEN
            RAISE EXCEPTION 'No target schema found for table %', idx_record.table_name;
        END IF;
        EXECUTE format('ALTER INDEX %s SET SCHEMA %I', idx_record.idx_name, target_schema);
    END LOOP;
END $$;
