-- liquibase formatted sql
-- changeset ahmer-mt:20250524122754 ignore:true
-- Create the denormalized table for chat metrics
CREATE TABLE denormalized_chat_messages_for_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID,
    chat_base_id VARCHAR(36),
    message_base_id VARCHAR(36),
    message_id UUID,
    chat_status VARCHAR(128),
    end_user_email VARCHAR,
    end_user_phone VARCHAR,
    feedback_rating INTEGER,
    feedback_text VARCHAR,
    customer_support_display_name VARCHAR(60),
    customer_support_id VARCHAR(555),
    customer_support_first_name VARCHAR(50),
    customer_support_last_name VARCHAR(50),
    created TIMESTAMP WITH TIME ZONE,
    updated TIMESTAMP WITH TIME ZONE,
    ended TIMESTAMP WITH TIME ZONE,
    first_message_timestamp TIMESTAMP WITH TIME ZONE,
    last_message_timestamp TIMESTAMP WITH TIME ZONE,
    message_created TIMESTAMP WITH TIME ZONE,
    message_updated TIMESTAMP WITH TIME ZONE,
    message_event event_type,
    message_author_role author_role_type,
    message_author_id VARCHAR(555),
    message_forwarded_from_csa VARCHAR,
    message_forwarded_to_csa VARCHAR,
    external_id VARCHAR,
    received_from VARCHAR,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


-- Index #1: Chat status + chat grouping + timestamp ordering
CREATE INDEX idx_denorm_metrics_chat_status_base_id_timestamp 
ON denormalized_chat_messages_for_metrics(chat_status, chat_base_id, timestamp DESC);

-- Index #2: Chat base ID + message author role filtering
CREATE INDEX idx_denorm_metrics_base_id_message_author_role 
ON denormalized_chat_messages_for_metrics(chat_base_id, message_author_role);

-- Index #3: Chat base ID + message event filtering
CREATE INDEX idx_denorm_metrics_base_id_message_event 
ON denormalized_chat_messages_for_metrics(chat_base_id, message_event);

-- Index #4: Created date sorting and filtering
CREATE INDEX idx_denorm_metrics_created 
ON denormalized_chat_messages_for_metrics(created);

-- Index #5: Chat base ID sorting and grouping
CREATE INDEX idx_denorm_metrics_chat_base_id
ON denormalized_chat_messages_for_metrics(chat_base_id);

-- Index #6: Message event + author role composite filtering
CREATE INDEX idx_denorm_metrics_message_event_author_role 
ON denormalized_chat_messages_for_metrics(message_event, message_author_role);

-- Index #7: Ended date sorting and filtering
CREATE INDEX idx_denorm_metrics_ended
ON denormalized_chat_messages_for_metrics(ended);

-- Index #8: Ended date + chat status + chat grouping + timestamp ordering
CREATE INDEX idx_denorm_metrics_ended_chat_status_base_id_timestamp 
ON denormalized_chat_messages_for_metrics(ended, chat_status, chat_base_id, timestamp DESC);

-- Index #9: Partial index for contact info fulfilled events
CREATE INDEX idx_denorm_metrics_message_event_contact_info 
ON denormalized_chat_messages_for_metrics(message_event) 
WHERE (end_user_email IS NOT NULL AND end_user_email <> '') 
  OR (end_user_phone IS NOT NULL AND end_user_phone <> '');

-- Index #10: Created date + chat grouping + timestamp ordering
CREATE INDEX idx_denorm_metrics_created_base_id_timestamp 
ON denormalized_chat_messages_for_metrics(created, chat_base_id, timestamp DESC);

-- Index #11: Feedback rating sorting and filtering
CREATE INDEX idx_denorm_metrics_feedback_rating
ON denormalized_chat_messages_for_metrics(feedback_rating);

-- Index #12: Message author role + created date composite filtering
CREATE INDEX idx_denorm_metrics_message_author_role_created 
ON denormalized_chat_messages_for_metrics(message_author_role, message_created);

-- Index #13: Chat base ID + message author ID filtering and grouping
CREATE INDEX idx_denorm_metrics_base_id_message_author_id 
ON denormalized_chat_messages_for_metrics(chat_base_id, message_author_id);

-- =============================================================================
-- UNUSED INDEXES - According to SCHEMA-004, these indexes were initially added
-- but after running EXPLAIN ANALYZE on all production queries, they showed 
-- 0 scans consistently and are not being utilized by the query planner.
-- They are commented out to reduce storage overhead and improve write performance.
-- =============================================================================

-- -- Index: Message ID + timestamp for distinct operations
-- CREATE INDEX idx_denorm_metrics_message_id_timestamp 
-- ON denormalized_chat_messages_for_metrics(message_id, timestamp DESC);

-- -- Index: Chat base ID + message ID + timestamp for distinct operations
-- CREATE INDEX idx_denorm_metrics_base_id_message_id_timestamp 
-- ON denormalized_chat_messages_for_metrics(chat_base_id, message_id, timestamp DESC);

-- -- Index: Created date + chat status composite filtering
-- CREATE INDEX idx_denorm_metrics_created_chat_status 
-- ON denormalized_chat_messages_for_metrics(created, chat_status);

-- -- Index: Chat base ID + chat status filtering
-- CREATE INDEX idx_denorm_metrics_base_id_chat_status 
-- ON denormalized_chat_messages_for_metrics(chat_base_id, chat_status);

-- -- Index: Chat base ID + feedback rating + timestamp for distinct operations
-- CREATE INDEX idx_denorm_metrics_base_id_feedback_rating_timestamp
-- ON denormalized_chat_messages_for_metrics(chat_base_id, feedback_rating, timestamp DESC);

-- -- Index: Chat base ID + customer support ID filtering
-- CREATE INDEX idx_denorm_metrics_base_id_customer_support_id 
-- ON denormalized_chat_messages_for_metrics(chat_base_id, customer_support_id);

-- -- Index: Chat base ID + message created date filtering
-- CREATE INDEX idx_denorm_metrics_base_id_message_created 
-- ON denormalized_chat_messages_for_metrics(chat_base_id, message_created);

-- -- Index: Chat base ID + message author ID + timestamp for distinct operations
-- CREATE INDEX idx_denorm_metrics_base_id_author_id_timestamp 
-- ON denormalized_chat_messages_for_metrics(chat_base_id, message_author_id, timestamp DESC);

-- -- Index: Feedback text sorting and filtering
-- CREATE INDEX idx_denorm_metrics_feedback_text
-- ON denormalized_chat_messages_for_metrics(feedback_text);

-- -- Index: Chat base ID + message base ID filtering
-- CREATE INDEX idx_denorm_metrics_base_id_message_base_id 
-- ON denormalized_chat_messages_for_metrics(chat_base_id, message_base_id);

-- -- Index: Received from filtering
-- CREATE INDEX idx_denorm_metrics_received_from 
-- ON denormalized_chat_messages_for_metrics(received_from);

-- -- Index: End user email filtering
-- CREATE INDEX idx_denorm_metrics_end_user_email 
-- ON denormalized_chat_messages_for_metrics(end_user_email);

-- -- Index: End user phone filtering
-- CREATE INDEX idx_denorm_metrics_end_user_phone 
-- ON denormalized_chat_messages_for_metrics(end_user_phone);

-- One-time population script for the denormalized table
INSERT INTO denormalized_chat_messages_for_metrics (
    chat_id,
    chat_base_id,
    message_base_id,
    message_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_rating,
    feedback_text,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    created,
    updated,
    ended,
    first_message_timestamp,
    last_message_timestamp,
    message_event,
    message_author_role,
    message_author_id,
    external_id,
    received_from,
    timestamp,
    message_created,
    message_updated,
    message_forwarded_from_csa,
    message_forwarded_to_csa
)
WITH combined_records AS (
    -- Message changes (when message changes)
    SELECT
        c.id AS chat_id,
        c.base_id AS chat_base_id,
        m.base_id AS message_base_id,
        m.id AS message_id,
        c.status AS chat_status,
        c.end_user_email,
        c.end_user_phone,
        c.feedback_rating,
        c.feedback_text,
        c.customer_support_display_name,
        c.customer_support_id,
        csa.first_name AS customer_support_first_name,
        csa.last_name AS customer_support_last_name,
        c.created,
        c.updated,
        c.ended,
        (SELECT MIN(created) FROM message WHERE chat_base_id = c.base_id AND created <= m.updated) AS first_message_timestamp,
        (SELECT MAX(created) FROM message WHERE chat_base_id = c.base_id AND created <= m.updated) AS last_message_timestamp,
        m.event AS message_event,
        m.author_role AS message_author_role,
        m.author_id AS message_author_id,
        c.external_id,
        c.received_from,
        m.updated AS timestamp,
        m.created AS message_created,
        m.updated AS message_updated,
        m.forwarded_from_csa,
        m.forwarded_to_csa
    FROM 
        message m
    LEFT JOIN LATERAL (
        SELECT *
        FROM chat c
        WHERE c.base_id = m.chat_base_id
        AND c.updated <= m.updated
        ORDER BY c.updated DESC
        LIMIT 1
    ) c ON true
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" csa
        WHERE csa.login = c.customer_support_id
        AND csa.created <= m.updated
        ORDER BY csa.created DESC
        LIMIT 1
    ) csa ON true
    
    UNION ALL
    
    -- Chat changes (when chat changes but with no corresponding message at the same timestamp)
    SELECT
        c.id AS chat_id,
        c.base_id AS chat_base_id,
        m.base_id AS message_base_id,
        m.id AS message_id,
        c.status AS chat_status,
        c.end_user_email,
        c.end_user_phone,
        c.feedback_rating,
        c.feedback_text,
        c.customer_support_display_name,
        c.customer_support_id,
        csa.first_name AS customer_support_first_name,
        csa.last_name AS customer_support_last_name,
        c.created,
        c.updated,
        c.ended,
        (SELECT MIN(created) FROM message WHERE chat_base_id = c.base_id AND created <= c.updated) AS first_message_timestamp,
        (SELECT MAX(created) FROM message WHERE chat_base_id = c.base_id AND created <= c.updated) AS last_message_timestamp,
        m.event AS message_event,
        m.author_role AS message_author_role,
        m.author_id AS message_author_id,
        c.external_id,
        c.received_from,
        c.updated AS timestamp,
        m.created AS message_created,
        m.updated AS message_updated,
        m.forwarded_from_csa,
        m.forwarded_to_csa
    FROM 
        chat c
    LEFT JOIN LATERAL (
        SELECT *
        FROM message m
        WHERE m.chat_base_id = c.base_id
        AND m.updated <= c.updated
        ORDER BY m.updated DESC
        LIMIT 1
    ) m ON true
    LEFT JOIN LATERAL (
        SELECT *
        FROM "user" csa
        WHERE csa.login = c.customer_support_id
        AND csa.created <= c.updated
        ORDER BY csa.created DESC
        LIMIT 1
    ) csa ON true
    WHERE NOT EXISTS (
        SELECT 1 
        FROM message 
        WHERE chat_base_id = c.base_id
        AND created = c.updated
    )
)
SELECT 
    chat_id,
    chat_base_id,
    message_base_id,
    message_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_rating,
    feedback_text,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    created,
    updated,
    ended,
    first_message_timestamp,
    last_message_timestamp,
    message_event,
    message_author_role,
    message_author_id,
    external_id,
    received_from,
    timestamp,
    message_created,
    message_updated,
    forwarded_from_csa,
    forwarded_to_csa
FROM combined_records
ORDER BY timestamp;