-- liquibase formatted sql
-- changeset baha-a:1715190365

CREATE INDEX idx_configuration_key ON configuration (key);
CREATE INDEX idx_chat_base_id ON chat (base_id);
CREATE INDEX idx_message_chat_base_id ON message (chat_base_id);
CREATE INDEX idx_message_event ON message (event);

