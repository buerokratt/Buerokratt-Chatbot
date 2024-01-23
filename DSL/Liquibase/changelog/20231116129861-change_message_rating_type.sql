-- liquibase formatted sql
-- changeset ahmedyasser:20231116129861
ALTER TABLE message ALTER COLUMN rating TYPE INT USING NULLIF(rating, '0')::integer;
