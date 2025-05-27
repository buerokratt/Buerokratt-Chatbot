-- liquibase formatted sql
-- changeset ahmer-mt:20250521122930 ignore:true
CREATE INDEX idx_establishment_base_id_created_deleted ON establishment (base_id, created DESC, deleted);