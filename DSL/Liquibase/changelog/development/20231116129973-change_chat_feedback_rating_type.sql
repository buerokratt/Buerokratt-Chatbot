-- liquibase formatted sql
-- changeset ahmedyasser:20231116129973
ALTER TABLE chat ALTER COLUMN feedback_rating TYPE INT USING CASE WHEN feedback_rating ~ '^\d+$' THEN feedback_rating::INTEGER ELSE NULL END;
