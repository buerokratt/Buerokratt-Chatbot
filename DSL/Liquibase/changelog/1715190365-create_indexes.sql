-- liquibase formatted sql
-- changeset baha-a:1715190365

CREATE INDEX IF NOT EXISTS idx_configuration_key ON configuration (key);
CREATE INDEX IF NOT EXISTS idx_chat_base_id ON chat (base_id);
CREATE INDEX IF NOT EXISTS idx_message_chat_base_id ON message (chat_base_id);
CREATE INDEX IF NOT EXISTS idx_message_event ON message (event);
