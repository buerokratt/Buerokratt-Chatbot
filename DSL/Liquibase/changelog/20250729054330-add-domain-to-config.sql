-- liquibase formatted sql
-- changeset vassili-m:20250729054330
ALTER TABLE configuration
    ADD COLUMN domain UUID DEFAULT NULL;