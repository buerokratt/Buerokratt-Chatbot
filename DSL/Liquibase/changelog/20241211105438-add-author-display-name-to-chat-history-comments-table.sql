-- liquibase formatted sql
-- changeset Janno Stern:20241211105438
ALTER TABLE chat_history_comments 
ADD COLUMN author_display_name TEXT;
