-- liquibase formatted sql
-- changeset baha-a:1711953793
ALTER TABLE chat
ADD COLUMN IF NOT EXISTS scheduled_for_terminated TIMESTAMP WITH TIME ZONE NULL;
