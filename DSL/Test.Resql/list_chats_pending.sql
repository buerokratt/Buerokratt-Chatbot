-- Idle Chats Queries Comparison Test
-- This script tests if the original complex query and the denormalized query produce the same results
-- for idle chats with different LIMIT values

-- Create a test parameters table
CREATE TEMPORARY TABLE test_params (
    test_id SERIAL PRIMARY KEY,
    limit_value INTEGER
);

-- Insert test cases with different limit values
INSERT INTO test_params (limit_value)
VALUES (5), (10), (25), (50), (100), (1000);

-- Create result tables for each query with test_id column
CREATE TEMPORARY TABLE original_query_results (
    test_id INTEGER,
    id TEXT,
    result_data JSONB,
    PRIMARY KEY (test_id, id)
);

CREATE TEMPORARY TABLE denormalized_query_results (
    test_id INTEGER,
    id TEXT,
    result_data JSONB,
    PRIMARY KEY (test_id, id)
);

-- Run each test case in a loop
DO $$
DECLARE
    param_record RECORD;
BEGIN
    FOR param_record IN SELECT * FROM test_params
    LOOP
        -- Run original query for this test case
        EXECUTE '
        WITH
            title_visibility AS (
                SELECT value
                FROM configuration
                WHERE key = ''is_csa_title_visible'' AND NOT deleted
                ORDER BY id DESC
                LIMIT 1
            ),

            message_with_content_and_not_rating_or_forward AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE
                    event <> ''rating''
                    AND event <> ''requested-chat-forward''
                    AND content <> ''''
                    AND content <> ''message-read''
                GROUP BY chat_base_id
            ),

            last_content_message AS (
                SELECT
                    content,
                    chat_base_id
                FROM message
                    INNER JOIN message_with_content_and_not_rating_or_forward ON id = max_id
            ),

            message_not_rating_or_forward AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE
                    event <> ''rating''
                    AND event <> ''requested-chat-forward''
                GROUP BY chat_base_id
            ),

            last_messages_time AS (
                SELECT
                    updated,
                    chat_base_id
                FROM message
                    INNER JOIN message_not_rating_or_forward ON id = max_id
            ),

            max_chats AS (
                SELECT MAX(id) AS max_id
                FROM chat
                GROUP BY base_id
            ),

            idle_chats AS (
                SELECT
                    base_id,
                    customer_support_id,
                    customer_support_display_name,
                    csa_title,
                    end_user_id,
                    end_user_first_name,
                    end_user_last_name,
                    status,
                    created,
                    updated,
                    ended,
                    end_user_email,
                    end_user_phone,
                    end_user_os,
                    end_user_url,
                    external_id,
                    forwarded_to,
                    forwarded_to_name,
                    received_from,
                    received_from_name
                FROM chat
                    INNER JOIN max_chats ON id = max_id
                WHERE status = ''IDLE''
            ),

            messages_with_event AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE event <> ''''
                GROUP BY chat_base_id
            ),

            last_message_event AS (
                SELECT
                    event,
                    chat_base_id
                FROM message
                    INNER JOIN messages_with_event ON id = max_id
            ),

            fulfilled_message AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE event = ''contact-information-fulfilled''
                GROUP BY chat_base_id
            ),

            contact_message AS (
                SELECT
                    content,
                    chat_base_id
                FROM message
                    INNER JOIN fulfilled_message ON id = max_id
            )

        INSERT INTO original_query_results (test_id, id, result_data)
        SELECT ' || param_record.test_id || ', 
            c.base_id,
            jsonb_build_object(
                ''customer_support_id'', c.customer_support_id,
                ''customer_support_display_name'', c.customer_support_display_name,
                ''end_user_id'', c.end_user_id,
                ''end_user_first_name'', c.end_user_first_name,
                ''end_user_last_name'', c.end_user_last_name,
                ''status'', c.status,
                ''created'', c.created,
                ''updated'', c.updated,
                ''ended'', c.ended,
                ''end_user_email'', c.end_user_email,
                ''end_user_phone'', c.end_user_phone,
                ''end_user_os'', c.end_user_os,
                ''end_user_url'', c.end_user_url,
                ''external_id'', c.external_id,
                ''forwarded_to'', c.forwarded_to,
                ''forwarded_to_name'', c.forwarded_to_name,
                ''received_from'', c.received_from,
                ''received_from_name'', c.received_from_name,
                ''last_message'', last_content_message.content,
                ''contacts_message'', contact_message.content,
                ''last_message_timestamp'', m.updated,
                ''last_message_event'', last_message_event.event,
                ''csa_title'', CASE WHEN title_visibility.value = ''true'' THEN c.csa_title ELSE '''' END
            )
        FROM idle_chats AS c
            LEFT JOIN last_messages_time AS m ON c.base_id = m.chat_base_id
            LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
            LEFT JOIN last_message_event ON c.base_id = last_message_event.chat_base_id
            LEFT JOIN contact_message ON c.base_id = contact_message.chat_base_id
            CROSS JOIN title_visibility
        ORDER BY created ASC 
        LIMIT ' || param_record.limit_value;
        
        -- Run denormalized query with subqueries for this test case
        EXECUTE '
        WITH idle_chats AS (
            SELECT DISTINCT ON (chat_id)
                *
            FROM denormalized_chat
            ORDER BY chat_id, id DESC
        )
        
        INSERT INTO denormalized_query_results (test_id, id, result_data)
        SELECT ' || param_record.test_id || ',
            chat_id,
            jsonb_build_object(
                ''customer_support_id'', customer_support_id,
                ''customer_support_display_name'', customer_support_display_name,
                ''end_user_id'', end_user_id,
                ''end_user_first_name'', end_user_first_name,
                ''end_user_last_name'', end_user_last_name,
                ''status'', status,
                ''created'', created,
                ''updated'', updated,
                ''ended'', ended,
                ''end_user_email'', end_user_email,
                ''end_user_phone'', end_user_phone,
                ''end_user_os'', end_user_os,
                ''end_user_url'', end_user_url,
                ''external_id'', external_id,
                ''forwarded_to'', forwarded_to,
                ''forwarded_to_name'', forwarded_to_name,
                ''received_from'', received_from,
                ''received_from_name'', received_from_name,
                ''last_message'', (
                    SELECT last_message
                    FROM denormalized_chat
                    WHERE chat_id = idle_chats.chat_id
                    AND last_message_event_with_content <> ''rating''
                    AND last_message_event_with_content <> ''requested-chat-forward''
                    AND last_message <> ''''
                    AND last_message <> ''message-read''
                    ORDER BY id DESC
                    LIMIT 1
                ),
                ''contacts_message'', contacts_message,
                ''last_message_timestamp'', (
                    SELECT last_message_timestamp
                    FROM denormalized_chat
                    WHERE chat_id = idle_chats.chat_id
                    AND last_message_event <> ''rating''
                    AND last_message_event <> ''requested-chat-forward''
                    ORDER BY id DESC
                    LIMIT 1
                ),
                ''last_message_event'', (
                    SELECT last_message_event
                    FROM denormalized_chat
                    WHERE chat_id = idle_chats.chat_id
                    AND last_message_event <> ''''
                    ORDER BY id DESC
                    LIMIT 1
                ),
                ''csa_title'', csa_title
            )
        FROM idle_chats
        WHERE status = ''IDLE''
        ORDER BY created ASC
        LIMIT ' || param_record.limit_value;
    
    END LOOP;
END $$;

-- Create comparison table to track differences
CREATE TEMPORARY TABLE comparison AS
SELECT
    o.test_id,
    COALESCE(o.id, d.id) AS id,
    o.id IS NOT NULL AS in_original,
    d.id IS NOT NULL AS in_denormalized,
    o.result_data = d.result_data AS data_match,
    CASE
        WHEN o.result_data IS NULL OR d.result_data IS NULL THEN NULL
        ELSE jsonb_object_agg(
            key,
            CASE
                WHEN o.result_data->key IS DISTINCT FROM d.result_data->key
                THEN jsonb_build_object('original', o.result_data->key, 'denormalized', d.result_data->key)
                ELSE NULL
            END
        ) FILTER (WHERE o.result_data->key IS DISTINCT FROM d.result_data->key)
    END AS differing_fields
FROM original_query_results o
FULL OUTER JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id,
LATERAL jsonb_object_keys(COALESCE(o.result_data, '{}'::jsonb)) AS key
GROUP BY o.test_id, o.id, d.id, o.result_data, d.result_data;

-- Show summary statistics per test case
SELECT
    p.test_id,
    'LIMIT ' || p.limit_value AS test_case,
    (SELECT COUNT(*) FROM original_query_results WHERE test_id = p.test_id) AS original_count,
    (SELECT COUNT(*) FROM denormalized_query_results WHERE test_id = p.test_id) AS denormalized_count,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND in_denormalized) AS matching_ids_count,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND NOT in_denormalized) AS only_in_original,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND NOT in_original AND in_denormalized) AS only_in_denormalized,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND in_denormalized AND NOT data_match) AS different_data_count,
    CASE
        WHEN (
            SELECT COUNT(*) FROM comparison 
            WHERE test_id = p.test_id AND (
                NOT in_original OR 
                NOT in_denormalized OR 
                NOT data_match
            )
        ) = 0
        THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result
FROM test_params p
ORDER BY p.test_id;

-- Show overall test results
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM comparison 
            WHERE 
                NOT in_original OR 
                NOT in_denormalized OR 
                NOT data_match
        )
        THEN 'FAIL: Queries return different results'
        ELSE 'PASS: Queries return identical results'
    END AS overall_test_result;

-- If there are differences, show detailed information about mismatches

-- Show records that exist only in original query
SELECT 'Only in original query' AS mismatch_type, 
       test_id, 
       id, 
       result_data->>'customer_support_display_name' AS display_name
FROM original_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE in_original AND NOT in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show records that exist only in denormalized query
SELECT 'Only in denormalized query' AS mismatch_type, 
       test_id, 
       id, 
       result_data->>'customer_support_display_name' AS display_name
FROM denormalized_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE NOT in_original AND in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show details of fields that differ for matching IDs
SELECT 
    'Data differences' AS mismatch_type,
    test_id,
    id,
    differing_fields
FROM comparison
WHERE in_original AND in_denormalized AND NOT data_match
ORDER BY test_id, id
LIMIT 10;

-- Clean up temporary tables
DROP TABLE test_params;
DROP TABLE original_query_results;
DROP TABLE denormalized_query_results;
DROP TABLE comparison;