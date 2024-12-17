-- liquibase formatted sql
-- changeset Janno Stern:20241210105636
ALTER TABLE chat_history_comments
ADD COLUMN IF NOT EXISTS created TIMESTAMP WITH TIME ZONE;

-- Update existing rows with a default timestamp (e.g., the current time or a specific value)
UPDATE chat_history_comments
SET created = NOW()
WHERE created IS NULL;
