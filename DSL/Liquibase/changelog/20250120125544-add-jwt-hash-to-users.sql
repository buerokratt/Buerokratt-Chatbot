-- liquibase formatted sql
-- changeset ahmedyasser:20250120125544
ALTER TABLE "user"
ADD COLUMN jwt_hash TEXT;
