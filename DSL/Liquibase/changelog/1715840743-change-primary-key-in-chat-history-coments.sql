-- liquibase formatted sql
-- changeset baha-a:1715840743

ALTER TABLE chat_history_comments
DROP CONSTRAINT IF EXISTS chat_history_comments_pkey,
ADD CONSTRAINT IF EXISTS chat_history_comments_pkey PRIMARY KEY (id);
