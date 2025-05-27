-- liquibase formatted sql
-- changeset ahmer-mt:20250522015721 ignore:true
-- liquibase formatted sql
-- changeset ahmer-mt:20250522023001:rollback ignore:true

BEGIN;

-- 1. Rollback chat.status
ALTER TABLE chat 
ADD COLUMN status_text VARCHAR(128);

UPDATE chat 
SET status_text = status::VARCHAR
WHERE status IS NOT NULL;

ALTER TABLE chat 
DROP COLUMN status;

ALTER TABLE chat 
RENAME COLUMN status_text TO status;

-- 2. Rollback denormalized_chat.status
ALTER TABLE denormalized_chat 
ADD COLUMN status_text VARCHAR;

UPDATE denormalized_chat 
SET status_text = status::VARCHAR
WHERE status IS NOT NULL;

ALTER TABLE denormalized_chat 
DROP COLUMN status;

ALTER TABLE denormalized_chat 
RENAME COLUMN status_text TO status;

-- 3. Rollback message.author_role
ALTER TABLE message 
ADD COLUMN author_role_text VARCHAR(128);

UPDATE message 
SET author_role_text = author_role::VARCHAR
WHERE author_role IS NOT NULL;

ALTER TABLE message 
DROP COLUMN author_role;

ALTER TABLE message 
RENAME COLUMN author_role_text TO author_role;

-- 4. Rollback denormalized_user_data.authority_name (array type)
ALTER TABLE denormalized_user_data 
ADD COLUMN authority_name_text VARCHAR[];

-- Using a different approach to convert the array elements
UPDATE denormalized_user_data 
SET authority_name_text = ARRAY(
    SELECT authority::VARCHAR 
    FROM unnest(authority_name) AS authority
)
WHERE authority_name IS NOT NULL;

ALTER TABLE denormalized_user_data 
DROP COLUMN authority_name;

ALTER TABLE denormalized_user_data 
RENAME COLUMN authority_name_text TO authority_name;

-- 5. Rollback message.event
ALTER TABLE message 
ADD COLUMN event_text VARCHAR(128);

UPDATE message 
SET event_text = event::VARCHAR
WHERE event IS NOT NULL;

ALTER TABLE message 
DROP COLUMN event;

ALTER TABLE message 
RENAME COLUMN event_text TO event;

-- 6. Rollback denormalized_chat.last_message_event
ALTER TABLE denormalized_chat 
ADD COLUMN last_message_event_text VARCHAR;

UPDATE denormalized_chat 
SET last_message_event_text = last_message_event::VARCHAR
WHERE last_message_event IS NOT NULL;

ALTER TABLE denormalized_chat 
DROP COLUMN last_message_event;

ALTER TABLE denormalized_chat 
RENAME COLUMN last_message_event_text TO last_message_event;

-- 7. Rollback denormalized_chat.last_message_event_with_content
ALTER TABLE denormalized_chat 
ADD COLUMN last_message_event_with_content_text VARCHAR;

UPDATE denormalized_chat 
SET last_message_event_with_content_text = last_message_event_with_content::VARCHAR
WHERE last_message_event_with_content IS NOT NULL;

ALTER TABLE denormalized_chat 
DROP COLUMN last_message_event_with_content;

ALTER TABLE denormalized_chat 
RENAME COLUMN last_message_event_with_content_text TO last_message_event_with_content;

-- 8. Rollback denormalized_chat.last_non_empty_message_event
ALTER TABLE denormalized_chat 
ADD COLUMN last_non_empty_message_event_text VARCHAR;

UPDATE denormalized_chat 
SET last_non_empty_message_event_text = last_non_empty_message_event::VARCHAR
WHERE last_non_empty_message_event IS NOT NULL;

ALTER TABLE denormalized_chat 
DROP COLUMN last_non_empty_message_event;

ALTER TABLE denormalized_chat 
RENAME COLUMN last_non_empty_message_event_text TO last_non_empty_message_event;

-- 9. Drop the ENUM types
DROP TYPE IF EXISTS chat_status_type;
DROP TYPE IF EXISTS event_type;
DROP TYPE IF EXISTS authority_role_type;
DROP TYPE IF EXISTS author_role_type;

-- Commit all rollback changes
COMMIT;