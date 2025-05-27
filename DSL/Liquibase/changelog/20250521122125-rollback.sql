-- liquibase formatted sql
-- changeset ahmer-mt:20250521122125 ignore:true
-- Rollback indexes for configuration table
DROP INDEX IF EXISTS idx_configuration_key_deleted_created;
DROP INDEX IF EXISTS idx_configuration_key_created;