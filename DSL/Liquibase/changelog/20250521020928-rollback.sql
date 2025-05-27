-- liquibase formatted sql
-- changeset ahmer-mt:20250521020928 ignore:true
-- Rollback indexes for messsage table
DROP INDEX IF EXISTS idx_message_base_id_updated;
DROP INDEX IF EXISTS idx_message_chat_id_base_id_updated;
DROP INDEX IF EXISTS idx_message_event;
DROP INDEX IF EXISTS idx_message_created;
DROP INDEX IF EXISTS idx_message_chat_base_id;
DROP INDEX IF EXISTS idx_message_content_trigram;
DROP INDEX IF EXISTS idx_message_updated_asc;
DROP INDEX IF EXISTS idx_message_chat_id_updated_created;

-- Note: Dropping the pg_trgm extension might affect other tables/indexes
-- Only uncomment this if you're sure no other objects depend on it
-- DROP EXTENSION IF EXISTS pg_trgm;