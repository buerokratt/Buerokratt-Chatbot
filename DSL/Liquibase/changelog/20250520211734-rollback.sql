-- liquibase formatted sql
-- changeset ahmer-mt:20250520211734 ignore:true
-- Rollback indexes for user_page_preferences table
DROP INDEX IF EXISTS idx_user_page_preferences_user_page_created;