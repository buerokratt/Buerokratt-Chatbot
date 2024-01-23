-- liquibase formatted sql
-- changeset ahmedyasser:20231116129965
ALTER TABLE "user" 
RENAME COLUMN login TO username;
