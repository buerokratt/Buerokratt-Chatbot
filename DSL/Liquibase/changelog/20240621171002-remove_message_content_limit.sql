-- liquibase formatted sql
-- changeset 1AhmedYasser:20240621171002

DROP INDEX idx_message_content;
ALTER TABLE message ALTER COLUMN content TYPE TEXT;
CREATE INDEX idx_message_content_hash ON message USING btree (MD5(content));
