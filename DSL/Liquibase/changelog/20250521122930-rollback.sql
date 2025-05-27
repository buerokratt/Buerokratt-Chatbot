-- liquibase formatted sql
-- changeset ahmer-mt:20250521122930 ignore:true
-- Rollback index for establishment table
DROP INDEX IF EXISTS idx_establishment_base_id_created_deleted;