-- liquibase formatted sql
-- changeset ahmer-mt:20250520211734 ignore:true
CREATE INDEX idx_user_page_preferences_user_page_created ON user_page_preferences 
(user_id, page_name, created DESC);