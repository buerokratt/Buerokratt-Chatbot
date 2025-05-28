-- liquibase formatted sql
-- changeset ahmer-mt:20250522022001 ignore:true
-- Begin transaction
BEGIN;

-- 1. Create ENUM types

-- Author role ENUM
CREATE TYPE author_role_type AS ENUM (
    'backoffice-user',
    'end-user',
    'Bürokratt',
    'buerokratt'
);

-- Authority role ENUM
CREATE TYPE authority_role_type AS ENUM (
    'ROLE_ADMINISTRATOR',
    'ROLE_SERVICE_MANAGER',
    'ROLE_CUSTOMER_SUPPORT_AGENT',
    'ROLE_CHATBOT_TRAINER',
    'ROLE_ANALYST',
    'ROLE_UNAUTHENTICATED'
);

-- Event type ENUM with lowercase values (as per the original schema)
CREATE TYPE event_type AS ENUM (
    '',
    'inactive-chat-ended',
    'taken-over',
    'unavailable_organization_ask_contacts',
    'answered',
    'terminated',
    'chat_sent_to_csa_email',
    'client-left',
    'client_left_with_accepted',
    'client_left_with_no_resolution',
    'client_left_for_unknown_reasons',
    'accepted',
    'hate_speech',
    'other',
    'response_sent_to_client_email',
    'greeting',
    'requested-authentication',
    'authentication_successful',
    'authentication_failed',
    'ask-permission',
    'ask-permission-accepted',
    'ask-permission-rejected',
    'ask-permission-ignored',
    'ask_to_forward_to_csa',
    'forwarded_to_backoffice',
    'continue_chatting_with_bot',
    'rating',
    'redirected',
    'contact-information',
    'contact-information-rejected',
    'contact-information-fulfilled',
    'unavailable-contact-information-fulfilled',
    'contact-information-skipped',
    'requested-chat-forward',
    'requested-chat-forward-accepted',
    'requested-chat-forward-rejected',
    'unavailable_organization',
    'unavailable_csas',
    'unavailable_csas_ask_contacts',
    'unavailable_holiday',
    'pending-assigned',
    'user-reached',
    'user-not-reached',
    'user-authenticated',
    'message-read',
    'waiting_validation',
    'approved_validation',
    'not-confident'
);

-- Chat status ENUM
CREATE TYPE chat_status_type AS ENUM (
    'ENDED',
    'OPEN',
    'REDIRECTED',
    'IDLE',
    'VALIDATING'
);

-- 2. Create helper functions for conversions

-- Function to convert text arrays to authority role arrays
CREATE OR REPLACE FUNCTION convert_text_array_to_authority_role_array(text_array varchar[])
RETURNS authority_role_type[] AS '
DECLARE
    result authority_role_type[];
    item varchar;
BEGIN
    IF text_array IS NULL THEN
        RETURN NULL;
    END IF;
    
    FOREACH item IN ARRAY text_array
    LOOP
        IF item IS NOT NULL AND item != '''' THEN
            result := array_append(result, item::authority_role_type);
        END IF;
    END LOOP;
    
    RETURN result;
END;
' LANGUAGE plpgsql;

-- Function for case-insensitive event conversion
CREATE OR REPLACE FUNCTION convert_to_lowercase_event_enum(input_text VARCHAR) 
RETURNS event_type AS '
DECLARE
    lowercase_input VARCHAR := lower(input_text);
BEGIN
    -- Try to cast the lowercase version to event_type
    BEGIN
        RETURN lowercase_input::event_type;
    EXCEPTION WHEN OTHERS THEN
        -- If casting fails, return NULL
        RETURN NULL;
    END;
END;
' LANGUAGE plpgsql;

-- 3. Update tables to use the new types

-- Update message.author_role
ALTER TABLE message 
ADD COLUMN author_role_enum author_role_type;

UPDATE message 
SET author_role_enum = NULLIF(author_role, '')::author_role_type
WHERE author_role IS NOT NULL AND author_role != '';

ALTER TABLE message 
DROP COLUMN author_role;

ALTER TABLE message 
RENAME COLUMN author_role_enum TO author_role;

-- Update denormalized_chat.authority_name (this is an array type)
ALTER TABLE denormalized_user_data 
ADD COLUMN authority_name_enum authority_role_type[];

UPDATE denormalized_user_data 
SET authority_name_enum = convert_text_array_to_authority_role_array(authority_name)
WHERE authority_name IS NOT NULL;

ALTER TABLE denormalized_user_data 
DROP COLUMN authority_name;

ALTER TABLE denormalized_user_data 
RENAME COLUMN authority_name_enum TO authority_name;

-- Update message.event with case-insensitive conversion
ALTER TABLE message 
ADD COLUMN event_enum event_type;

UPDATE message 
SET event_enum = convert_to_lowercase_event_enum(event)
WHERE event IS NOT NULL;

ALTER TABLE message 
DROP COLUMN event;

ALTER TABLE message 
RENAME COLUMN event_enum TO event;

-- Update denormalized_chat.last_message_event with case-insensitive conversion
ALTER TABLE denormalized_chat 
ADD COLUMN last_message_event_enum event_type;

UPDATE denormalized_chat 
SET last_message_event_enum = convert_to_lowercase_event_enum(last_message_event)
WHERE last_message_event IS NOT NULL;

ALTER TABLE denormalized_chat 
DROP COLUMN last_message_event;

ALTER TABLE denormalized_chat 
RENAME COLUMN last_message_event_enum TO last_message_event;

-- Update denormalized_chat.last_message_event_with_content with case-insensitive conversion
ALTER TABLE denormalized_chat 
ADD COLUMN last_message_event_with_content_enum event_type;

UPDATE denormalized_chat 
SET last_message_event_with_content_enum = convert_to_lowercase_event_enum(last_message_event_with_content)
WHERE last_message_event_with_content IS NOT NULL AND last_message_event_with_content != '';

ALTER TABLE denormalized_chat 
DROP COLUMN last_message_event_with_content;

ALTER TABLE denormalized_chat 
RENAME COLUMN last_message_event_with_content_enum TO last_message_event_with_content;

-- Update denormalized_chat.last_non_empty_message_event with case-insensitive conversion
ALTER TABLE denormalized_chat 
ADD COLUMN last_non_empty_message_event_enum event_type;

UPDATE denormalized_chat 
SET last_non_empty_message_event_enum = convert_to_lowercase_event_enum(last_non_empty_message_event)
WHERE last_non_empty_message_event IS NOT NULL;

ALTER TABLE denormalized_chat 
DROP COLUMN last_non_empty_message_event;

ALTER TABLE denormalized_chat 
RENAME COLUMN last_non_empty_message_event_enum TO last_non_empty_message_event;

-- Update chat.status
ALTER TABLE chat 
ADD COLUMN status_enum chat_status_type;

UPDATE chat 
SET status_enum = NULLIF(status, '')::chat_status_type
WHERE status IS NOT NULL AND status != '';

ALTER TABLE chat 
DROP COLUMN status;

ALTER TABLE chat 
RENAME COLUMN status_enum TO status;

-- Update denormalized_chat.status
ALTER TABLE denormalized_chat 
ADD COLUMN status_enum chat_status_type;

UPDATE denormalized_chat 
SET status_enum = NULLIF(status, '')::chat_status_type
WHERE status IS NOT NULL AND status != '';

ALTER TABLE denormalized_chat 
DROP COLUMN status;

ALTER TABLE denormalized_chat 
RENAME COLUMN status_enum TO status;

-- 4. Drop the helper functions as they're no longer needed
DROP FUNCTION IF EXISTS convert_text_array_to_authority_role_array;
DROP FUNCTION IF EXISTS convert_to_lowercase_event_enum;

-- Commit all changes
COMMIT;