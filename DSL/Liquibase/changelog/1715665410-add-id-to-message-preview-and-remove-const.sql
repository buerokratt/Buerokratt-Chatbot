-- liquibase formatted sql
-- changeset baha-a:1715665410
ALTER TABLE message_preview
ADD COLUMN IF NOT EXISTS id SERIAL PRIMARY KEY,
DROP CONSTRAINT IF EXISTS message_preview_chat_base_id_key;
