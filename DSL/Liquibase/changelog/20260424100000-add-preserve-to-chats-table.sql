-- liquibase formatted sql
-- changeset ahmedyasser:20260424100000
ALTER TABLE chat
ADD COLUMN preserve BOOLEAN NOT NULL DEFAULT false;
