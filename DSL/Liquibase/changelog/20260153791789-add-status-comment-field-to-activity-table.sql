-- liquibase formatted sql
-- changeset ahmedyasser:20260153791789
ALTER TABLE customer_support_agent_activity
ADD COLUMN status_comment TEXT DEFAULT '';
