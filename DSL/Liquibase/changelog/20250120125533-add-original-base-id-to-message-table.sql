-- liquibase formatted sql
-- changeset jannostern:20250120125533
ALTER TABLE "message" 
ADD COLUMN original_base_id TEXT DEFAULT NULL;
