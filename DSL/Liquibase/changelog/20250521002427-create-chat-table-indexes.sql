-- liquibase formatted sql
-- changeset ahmer-mt:20250521002427 ignore:true
-- Index for NPS calculation
CREATE INDEX idx_chat_base_id_feedback_rating ON chat (base_id, feedback_rating);

-- Index for customer support queries
CREATE INDEX idx_chat_base_id_customer_support_ended_created ON chat 
(base_id, customer_support_id, ended, created);

-- Index for counting ended chats by date range
CREATE INDEX idx_chat_created_status_ended ON chat (created, status, ended);

-- Dedicated index for finding the latest updated record
CREATE INDEX idx_chat_base_id_updated ON chat (base_id, updated DESC);

-- Index for ended chats with empty end users by date
CREATE INDEX idx_chat_ended_status_end_user_id ON chat (ended, status, end_user_id);

-- Index for IDLE status chat counting by date range
CREATE INDEX idx_chat_status_created_base_id 
ON chat (status, created, base_id);

-- Index for customer support transition analysis with window functions
CREATE INDEX idx_chat_created_base_updated_support 
ON chat (created, base_id, updated, customer_support_id);

-- Index for external ID chat queries by end date
CREATE INDEX idx_chat_ended_date_external_base 
ON chat (ended, external_id, base_id);
