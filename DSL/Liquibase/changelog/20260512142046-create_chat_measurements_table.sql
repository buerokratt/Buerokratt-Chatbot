-- liquibase formatted sql
-- changeset trevorling:20260512142046
CREATE TYPE measurement_type AS ENUM ('THEME', 'QUALITY', 'FOLLOW_UP_ACTION');


CREATE TABLE chat_measurements (
    id SERIAL PRIMARY KEY,
    chat_base_id UUID NOT NULL,
    author_display_name TEXT NOT NULL,
    type measurement_type NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
