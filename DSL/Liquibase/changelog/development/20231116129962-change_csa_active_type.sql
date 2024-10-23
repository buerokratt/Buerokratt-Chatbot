-- liquibase formatted sql
-- changeset ahmedyasser:20231116129962
ALTER TABLE customer_support_agent_activity ALTER COLUMN active SET DEFAULT false;
ALTER TABLE customer_support_agent_activity ALTER COLUMN active TYPE BOOL USING active::boolean;
