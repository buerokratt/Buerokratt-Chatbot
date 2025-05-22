-- liquibase formatted sql
-- changeset ahmer-mt:20250521021652 ignore:true
-- Composite index for filtering by chat_id and ordering by created DESC
CREATE INDEX idx_chat_history_comments_chat_id_created ON chat_history_comments (chat_id, created DESC);

-- Trigram index for ILIKE text searches on comment field
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_chat_history_comments_comment_trigram ON chat_history_comments USING GIN (comment gin_trgm_ops);