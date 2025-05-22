-- liquibase formatted sql
-- changeset ahmer-mt:20250521020928 ignore:true
-- Index for filtering by base_id and sorting by updated DESC
CREATE INDEX idx_message_base_id_updated ON message (base_id, updated DESC);

-- Index for filtering by chat_base_id with DISTINCT ON base_id and ordering
CREATE INDEX idx_message_chat_id_base_id_updated ON message (chat_base_id, base_id, updated DESC);

-- Index for ordering by created
CREATE INDEX idx_message_created ON message (created);

-- Trigram index for ILIKE text searches on content field
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_message_content_trigram ON message USING GIN (content gin_trgm_ops);

-- Index for ordering by updated ASC
CREATE INDEX idx_message_updated_asc ON message (updated ASC);

-- Index for the frequently used query with combined filtering and ordering
CREATE INDEX idx_message_chat_id_updated_created ON message (chat_base_id, updated, created ASC);