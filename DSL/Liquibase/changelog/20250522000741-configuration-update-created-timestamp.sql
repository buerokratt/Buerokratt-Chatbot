-- liquibase formatted sql
-- changeset ahmer-mt:20250522000741 ignore:true
WITH max_ids AS (
  SELECT key, MAX(id) as max_id
  FROM configuration
  GROUP BY key
)
UPDATE configuration
SET created = now()
WHERE created IS NULL AND deleted = FALSE
AND id IN (SELECT max_id FROM max_ids);
