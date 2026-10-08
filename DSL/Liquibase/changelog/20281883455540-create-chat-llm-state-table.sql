-- liquibase formatted sql
-- changeset 1AhmedYasser:20281883455540
CREATE TABLE chat_llm_state (
    chat_base_id VARCHAR(36) PRIMARY KEY,
    previous_response_id VARCHAR(255) NOT NULL,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
