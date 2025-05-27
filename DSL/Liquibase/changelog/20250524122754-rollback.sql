-- liquibase formatted sql
-- changeset ahmer-mt:20250524122754 ignore:true
-- Drop indexes first
DROP INDEX IF EXISTS idx_denorm_chat_base_id;
DROP INDEX IF EXISTS idx_denorm_timestamp;
DROP INDEX IF EXISTS idx_denorm_message_id;
DROP INDEX IF EXISTS idx_denorm_chat_id;

-- Drop the denormalized table
DROP TABLE IF EXISTS denormalized_chat_messages_for_metrics;