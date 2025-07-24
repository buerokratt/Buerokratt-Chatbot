-- liquibase formatted sql
-- changeset jannostern:20250210145003

CREATE TABLE IF NOT EXISTS chat_smax_syncrhonization (
    id BIGSERIAL NOT NULL,
    chat_base_id VARCHAR(36) NOT NULL,
    status TEXT NOT NULL DEFAULT 'NONE',
    smax_status_code TEXT,
    smax_error_message TEXT,
    created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_smax_syncrhonization_chat_base_id ON chat_smax_syncrhonization (chat_base_id);
CREATE INDEX IF NOT EXISTS idx_chat_smax_syncrhonization_status ON chat_smax_syncrhonization (status);
CREATE INDEX IF NOT EXISTS idx_chat_smax_syncrhonization_created ON chat_smax_syncrhonization (created);
