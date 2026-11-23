-- liquibase formatted sql
-- changeset 1AhmedYasser:20281883455540
CREATE TABLE chat_llm_state (
    chat_base_id UUID PRIMARY KEY,
    previous_response_id TEXT NOT NULL,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
