-- liquibase formatted sql
-- changeset ahmer-mt:20250520210317 ignore:true
CREATE INDEX idx_user_id_code_created_status ON "user" (id_code, created DESC, status);
