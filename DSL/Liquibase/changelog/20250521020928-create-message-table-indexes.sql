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

-- Index for the frequently used query with combined filtering and ordering
CREATE INDEX idx_message_chat_id_updated_created ON message (chat_base_id, updated, created ASC);

-- Index for message queries filtering by author role and date with chat grouping
CREATE INDEX idx_message_chat_author_created 
ON message (chat_base_id, author_role, created DESC);

CREATE INDEX idx_message_chat_chatbot_created 
ON message (created) 
WHERE author_role = 'buerokratt';

-- Partial index for non-chatbot messages to optimize subquery performance
CREATE INDEX idx_message_chat_non_chatbot_created 
ON message (chat_base_id, created DESC) 
WHERE author_role <> 'buerokratt';

-- Index for message queries filtering by intent
CREATE INDEX idx_message_created_chat_base_id_intent 
ON message (created, chat_base_id, intent);


-- Index for chatbot message analysis queries
CREATE INDEX idx_message_chatbot_created_event 
ON message (author_role, created, event);

CREATE INDEX idx_message_chat_event_updated 
ON message (chat_base_id, event, updated DESC);