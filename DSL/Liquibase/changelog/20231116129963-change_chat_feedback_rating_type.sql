-- liquibase formatted sql
-- changeset ahmedyasser:20231116129963
ALTER TABLE chat ALTER COLUMN feedback_rating TYPE INT USING NULLIF(feedback_rating, '')::integer;
