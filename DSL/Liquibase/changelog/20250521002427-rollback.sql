-- liquibase formatted sql
-- changeset ahmer-mt:20250521002427 ignore:true
-- Rollback indexes for chat table
DROP INDEX IF EXISTS idx_chat_base_id_feedback_rating;
DROP INDEX IF EXISTS idx_chat_base_id_customer_support_ended_created;
DROP INDEX IF EXISTS idx_chat_created_status_ended;
DROP INDEX IF EXISTS idx_chat_base_id_updated;
DROP INDEX IF EXISTS idx_chat_ended_status_end_user_id;
DROP INDEX IF EXISTS idx_chat_status_created_base_id;
DROP INDEX IF EXISTS idx_chat_created_base_updated_support;
DROP INDEX IF EXISTS idx_chat_ended_date_external_base;
