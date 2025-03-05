-- liquibase formatted sql
-- changeset jannostern:20250211094822

ALTER TABLE "user" 
ADD COLUMN smax_account_id TEXT NOT NULL DEFAULT '';
