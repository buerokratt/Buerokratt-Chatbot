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

-- analytics schema
ALTER TABLE IF EXISTS analytics.scheduled_reports SET SCHEMA public;

-- 2. Drop schemas if empty
DROP SCHEMA IF EXISTS auth_users;
DROP SCHEMA IF EXISTS chat;
DROP SCHEMA IF EXISTS config;
DROP SCHEMA IF EXISTS org;
DROP SCHEMA IF EXISTS security;
DROP SCHEMA IF EXISTS analytics;

DO $$
DECLARE
    idx_record RECORD;
    all_tables TEXT[] := ARRAY[
        -- Config schema tables
        'allowed_statuses', 'authority', 'configuration',
        -- Chat schema tables
        'chat', 'chat_history_comments', 'chat_jira_syncrhonization', 
        'chat_smax_syncrhonization', 'denormalized_chat', 
        'denormalized_chat_messages_for_metrics', 'message', 'message_preview',
        -- Auth_users schema tables
        'denormalized_user_data', 'user', 
        'user_overview_metric_preference', 'user_page_preference',
        -- Org schema tables
        'establishment',
        -- Security schema tables
        'request_nonces',
        -- Analytics schema tables
        'scheduled_reports'
    ];
    schemas TEXT[] := ARRAY['config', 'chat', 'auth_users', 'org', 'security', 'analytics'];
BEGIN
    -- Loop through each schema that might contain our indexes
    FOREACH schema_name IN ARRAY schemas
    LOOP
        -- For each table, find all its indexes in the non-public schema
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
            WHERE t.relname = ANY(all_tables)
            AND idx_ns.nspname = schema_name  -- Only indexes in the specified schema
        LOOP
            EXECUTE format('ALTER INDEX %s SET SCHEMA public', idx_record.idx_name);
        END LOOP;
    END LOOP;
END $$;

COMMIT;
