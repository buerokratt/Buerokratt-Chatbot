-- liquibase formatted sql
-- changeset ahmer-mt:20250521122125 ignore:true
-- For queries that filter by deleted status
CREATE INDEX idx_configuration_key_deleted_created ON configuration (key, deleted, created DESC);

-- For queries that don't filter by deleted status
CREATE INDEX idx_configuration_key_created ON configuration (key, created DESC);