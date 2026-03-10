-- liquibase formatted sql
-- changeset vassilim:20250901152400
ALTER TABLE chat
RENAME COLUMN isTest TO test;
