-- liquibase formatted sql
-- changeset 1AhmedYasser:20281883455542
ALTER TABLE message ADD COLUMN IF NOT EXISTS end_user_url TEXT NULL;
