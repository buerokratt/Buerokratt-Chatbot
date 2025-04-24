-- liquibase formatted sql
-- changeset ahmedyasser:20250153791789
ALTER TABLE customer_support_agent_activity
ADD COLUMN IF NOT EXISTS status_comment TEXT DEFAULT '';
