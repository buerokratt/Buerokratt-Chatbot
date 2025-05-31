-- liquibase formatted sql
-- changeset ahmer-mt:20250528010229 ignore:true
CREATE INDEX idx_scheduled_reports_dataset_updated_deleted
ON scheduled_reports (dataset_id, updated DESC, deleted);
