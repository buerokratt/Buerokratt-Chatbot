-- liquibase formatted sql
-- changeset vassilim:20250822152400
ALTER TABLE chat
ADD COLUMN isTest BOOLEAN NOT NULL DEFAULT false;
