-- liquibase formatted sql
-- changeset baha-a:20240621171000
ALTER TABLE message
ADD COLUMN IF NOT EXISTS options TEXT;
