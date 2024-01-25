-- liquibase formatted sql
-- changeset ahmedyasser:20231116129861
ALTER TABLE message ALTER COLUMN rating TYPE INT USING CASE WHEN rating ~ '^\d+$' THEN rating::INTEGER ELSE NULL END;
