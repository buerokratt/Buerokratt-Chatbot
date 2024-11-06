-- liquibase formatted sql
-- changeset 1AhmedYasser:20240621171002

DROP INDEX IF EXISTS idx_message_content;
ALTER TABLE message ALTER COLUMN content TYPE TEXT;
CREATE INDEX IF NOT EXISTS idx_message_content_hash ON message USING btree (MD5(content));
