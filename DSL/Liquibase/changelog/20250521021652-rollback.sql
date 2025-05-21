-- liquibase formatted sql
-- changeset ahmer-mt:20250521021652 ignore:true
-- Rollback indexes for chat_history_comments table
DROP INDEX IF EXISTS idx_chat_history_comments_chat_id_created;
DROP INDEX IF EXISTS idx_chat_history_comments_comment_trigram;

-- Note: Dropping the pg_trgm extension might affect other tables/indexes
-- Only uncomment this if you're sure no other objects depend on it
-- DROP EXTENSION IF EXISTS pg_trgm;