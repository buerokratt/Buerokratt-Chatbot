-- liquibase formatted sql
-- changeset ahmedyasser:20260153791945
ALTER TABLE chat 
ADD COLUMN feedback_rating_five INTEGER;
