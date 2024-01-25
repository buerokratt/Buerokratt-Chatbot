-- liquibase formatted sql
-- changeset ahmedyasser:20231116129964
ALTER TABLE "user" ALTER COLUMN status TYPE user_status USING NULLIF(status, '')::user_status;
