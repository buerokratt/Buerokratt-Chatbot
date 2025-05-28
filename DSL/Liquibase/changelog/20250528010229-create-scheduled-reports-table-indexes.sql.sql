-- liquibase formatted sql
-- changeset ahmer-mt:20250528010229 ignore:true
CREATE INDEX idx_scheduled_reports_dataset_id_desc 
ON scheduled_reports (dataset_id, id DESC);