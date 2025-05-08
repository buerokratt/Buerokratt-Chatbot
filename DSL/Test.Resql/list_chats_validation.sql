-- Create a simple test table with test parameters and test_id
CREATE TEMPORARY TABLE test_params (
    test_id SERIAL PRIMARY KEY,
    limit_value INTEGER DEFAULT 10
);

-- Insert test cases
INSERT INTO test_params (limit_value)
-- Test case 1: Default limit
VALUES (10)
-- Test case 2: Small limit
UNION ALL SELECT 5
-- Test case 3: Larger limit
UNION ALL SELECT 20
-- Test case 4: Very large limit
UNION ALL SELECT 50
-- Test case 5: Minimum limit
UNION ALL SELECT 1;

-- Run through each test case and compare results
SELECT 'Running test case ' || test_id AS test_case,
       limit_value
FROM test_params;

-- Create result tables for each query with test_id column
CREATE TEMPORARY TABLE original_query_results (
    test_id INTEGER,
    id TEXT,
    customer_support_id TEXT,
    customer_support_display_name TEXT,
    end_user_id TEXT,
    end_user_first_name TEXT,
    end_user_last_name TEXT,
    status TEXT,
    created TIMESTAMP,
    updated TIMESTAMP,
    ended TIMESTAMP,
    end_user_email TEXT,
    end_user_phone TEXT,
    end_user_os TEXT,
    end_user_url TEXT,
    external_id TEXT,
    forwarded_to TEXT,
    forwarded_to_name TEXT,
    received_from TEXT,
    received_from_name TEXT,
    last_message TEXT,
    contacts_message TEXT,
    last_message_timestamp TIMESTAMP,
    last_message_event TEXT,
    csa_title TEXT,
    PRIMARY KEY (test_id, id)
);

CREATE TEMPORARY TABLE denormalized_query_results (
    test_id INTEGER,
    id TEXT,
    customer_support_id TEXT,
    customer_support_display_name TEXT,
    end_user_id TEXT,
    end_user_first_name TEXT,
    end_user_last_name TEXT,
    status TEXT,
    created TIMESTAMP,
    updated TIMESTAMP,
    ended TIMESTAMP,
    end_user_email TEXT,
    end_user_phone TEXT,
    end_user_os TEXT,
    end_user_url TEXT,
    external_id TEXT,
    forwarded_to TEXT,
    forwarded_to_name TEXT,
    received_from TEXT,
    received_from_name TEXT,
    last_message TEXT,
    contacts_message TEXT,
    last_message_timestamp TIMESTAMP,
    last_message_event TEXT,
    csa_title TEXT,
    PRIMARY KEY (test_id, id)
);

-- Now run each test case individually in a loop
DO $$
DECLARE
    param_record RECORD;
BEGIN
    FOR param_record IN SELECT * FROM test_params
    LOOP
        -- Run original query for this test case
        EXECUTE 'WITH title_visibility AS (
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
            
            latest_chat AS (
                SELECT
                    base_id,
                    MAX(id) AS max_id
                FROM chat
                GROUP BY base_id
            ),
            
            validation_messages AS (
                SELECT m.chat_base_id AS chat_id
                FROM message AS m
                    INNER JOIN
                        latest_chat ON m.chat_base_id = latest_chat.base_id
                    INNER JOIN chat AS c ON latest_chat.max_id = c.id
                WHERE m.id = (
                    SELECT MAX(id)
                    FROM message
                    WHERE chat_base_id = m.chat_base_id
                )
                AND m.event = ''waiting_validation'' AND c.ended IS NULL
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
                WHERE base_id IN (SELECT chat_id FROM validation_messages)
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
            
            INSERT INTO original_query_results (
                test_id, 
                id, 
                customer_support_id, 
                customer_support_display_name, 
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
                received_from_name, 
                last_message, 
                contacts_message, 
                last_message_timestamp, 
                last_message_event, 
                csa_title
            )
            SELECT 
                ' || param_record.test_id || ',
                c.base_id AS id,
                c.customer_support_id,
                c.customer_support_display_name,
                c.end_user_id,
                c.end_user_first_name,
                c.end_user_last_name,
                c.status,
                c.created,
                c.updated,
                c.ended,
                c.end_user_email,
                c.end_user_phone,
                c.end_user_os,
                c.end_user_url,
                c.external_id,
                c.forwarded_to,
                c.forwarded_to_name,
                c.received_from,
                c.received_from_name,
                last_content_message.content AS last_message,
                contact_message.content AS contacts_message,
                m.updated AS last_message_timestamp,
                last_message_event.event AS last_message_event,
                (
                    CASE WHEN title_visibility.value = ''true'' THEN c.csa_title ELSE '''' END
                ) AS csa_title
            FROM idle_chats AS c
                LEFT JOIN last_messages_time AS m ON c.base_id = m.chat_base_id
                LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
                LEFT JOIN last_message_event ON last_message_event.chat_base_id = c.base_id
                LEFT JOIN contact_message ON c.base_id = contact_message.chat_base_id
                CROSS JOIN title_visibility
            ORDER BY created ASC
            LIMIT ' || param_record.limit_value;

        -- Run denormalized query for this test case
        EXECUTE 'INSERT INTO denormalized_query_results (
                test_id, 
                id, 
                customer_support_id, 
                customer_support_display_name, 
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
                received_from_name, 
                last_message, 
                contacts_message, 
                last_message_timestamp, 
                last_message_event, 
                csa_title
            )
            SELECT 
                ' || param_record.test_id || ',
                chat_id AS id,
                customer_support_id,
                customer_support_display_name,
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
                received_from,
                last_message_with_content_and_not_rating_or_forward AS last_message,
                contacts_message,
                last_message_with_not_rating_or_forward_events_timestamp AS last_message_timestamp,
                last_non_empty_message_event AS last_message_event,
                csa_title
            FROM (
                SELECT
                    chat_id,
                    customer_support_id,
                    customer_support_display_name,
                    end_user_id,
                    end_user_first_name,
                    end_user_last_name,
                    end_user_email,
                    end_user_phone,
                    end_user_os,
                    end_user_url,
                    status,
                    updated,
                    ended,
                    forwarded_to,
                    forwarded_to_name,
                    received_from,
                    received_from_name,
                    external_id,
                    contacts_message,
                    csa_title,
                    CASE WHEN last_message_event IS NULL OR last_message_event = '''' THEN NULL 
                    ELSE last_message_event END AS last_message_event,
                    created,
                    last_message_with_content_and_not_rating_or_forward,
                    last_message_with_not_rating_or_forward_events_timestamp,
                    last_non_empty_message_event,
                    ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY id DESC) as rn
                FROM denormalized_chat
            ) AS c
            WHERE rn = 1 AND
                ended is NULL and
                last_message_event = ''waiting_validation''
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
    (o.customer_support_id = d.customer_support_id OR (o.customer_support_id IS NULL AND d.customer_support_id IS NULL)) AND
    (o.customer_support_display_name = d.customer_support_display_name OR (o.customer_support_display_name IS NULL AND d.customer_support_display_name IS NULL)) AND
    (o.end_user_id = d.end_user_id OR (o.end_user_id IS NULL AND d.end_user_id IS NULL)) AND
    (o.end_user_first_name = d.end_user_first_name OR (o.end_user_first_name IS NULL AND d.end_user_first_name IS NULL)) AND
    (o.end_user_last_name = d.end_user_last_name OR (o.end_user_last_name IS NULL AND d.end_user_last_name IS NULL)) AND
    (o.status = d.status OR (o.status IS NULL AND d.status IS NULL)) AND
    (o.created = d.created OR (o.created IS NULL AND d.created IS NULL)) AND
    (o.updated = d.updated OR (o.updated IS NULL AND d.updated IS NULL)) AND
    (o.ended = d.ended OR (o.ended IS NULL AND d.ended IS NULL)) AND
    (o.end_user_email = d.end_user_email OR (o.end_user_email IS NULL AND d.end_user_email IS NULL)) AND
    (o.end_user_phone = d.end_user_phone OR (o.end_user_phone IS NULL AND d.end_user_phone IS NULL)) AND
    (o.end_user_os = d.end_user_os OR (o.end_user_os IS NULL AND d.end_user_os IS NULL)) AND
    (o.end_user_url = d.end_user_url OR (o.end_user_url IS NULL AND d.end_user_url IS NULL)) AND
    (o.external_id = d.external_id OR (o.external_id IS NULL AND d.external_id IS NULL)) AND
    (o.forwarded_to = d.forwarded_to OR (o.forwarded_to IS NULL AND d.forwarded_to IS NULL)) AND
    (o.forwarded_to_name = d.forwarded_to_name OR (o.forwarded_to_name IS NULL AND d.forwarded_to_name IS NULL)) AND
    (o.received_from = d.received_from OR (o.received_from IS NULL AND d.received_from IS NULL)) AND
    (o.received_from_name = d.received_from_name OR (o.received_from_name IS NULL AND d.received_from_name IS NULL)) AND
    (o.last_message = d.last_message OR (o.last_message IS NULL AND d.last_message IS NULL)) AND
    (o.contacts_message = d.contacts_message OR (o.contacts_message IS NULL AND d.contacts_message IS NULL)) AND
    (o.last_message_timestamp = d.last_message_timestamp OR (o.last_message_timestamp IS NULL AND d.last_message_timestamp IS NULL)) AND
    (o.last_message_event = d.last_message_event OR (o.last_message_event IS NULL AND d.last_message_event IS NULL)) AND
    (o.csa_title = d.csa_title OR (o.csa_title IS NULL AND d.csa_title IS NULL)) AS data_match
FROM original_query_results o
FULL OUTER JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id;

-- Show summary statistics per test case
SELECT
    p.test_id,
    'Running test case ' || p.test_id AS test_case,
    p.limit_value,
    (SELECT COUNT(*) FROM original_query_results WHERE test_id = p.test_id) AS original_count,
    (SELECT COUNT(*) FROM denormalized_query_results WHERE test_id = p.test_id) AS denormalized_count,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND in_denormalized) AS matching_ids_count,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND NOT in_denormalized) AS only_in_original,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND NOT in_original AND in_denormalized) AS only_in_denormalized,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND in_denormalized AND NOT data_match) AS different_data_count
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

-- Show records that exist only in original query
SELECT 'Only in original query' AS mismatch_type, 
       test_id, 
       id, 
       customer_support_display_name,
       end_user_first_name,
       end_user_last_name,
       status,
       created,
       last_message_event
FROM original_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE in_original AND NOT in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show records that exist only in denormalized query
SELECT 'Only in denormalized query' AS mismatch_type, 
       test_id, 
       id, 
       customer_support_display_name,
       end_user_first_name,
       end_user_last_name,
       status,
       created,
       last_message_event
FROM denormalized_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE NOT in_original AND in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show details of fields that differ for matching IDs
SELECT 
    o.test_id,
    o.id,
    'Field comparison' AS details,
    o.customer_support_id AS orig_customer_support_id, 
    d.customer_support_id AS denorm_customer_support_id,
    o.customer_support_display_name AS orig_customer_support_display_name, 
    d.customer_support_display_name AS denorm_customer_support_display_name,
    o.end_user_id AS orig_end_user_id, 
    d.end_user_id AS denorm_end_user_id,
    o.end_user_first_name AS orig_end_user_first_name, 
    d.end_user_first_name AS denorm_end_user_first_name,
    o.end_user_last_name AS orig_end_user_last_name, 
    d.end_user_last_name AS denorm_end_user_last_name,
    o.status AS orig_status, 
    d.status AS denorm_status,
    o.created AS orig_created, 
    d.created AS denorm_created,
    o.updated AS orig_updated, 
    d.updated AS denorm_updated,
    o.ended AS orig_ended, 
    d.ended AS denorm_ended,
    o.last_message AS orig_last_message, 
    d.last_message AS denorm_last_message,
    o.contacts_message AS orig_contacts_message, 
    d.contacts_message AS denorm_contacts_message,
    o.last_message_timestamp AS orig_last_message_timestamp, 
    d.last_message_timestamp AS denorm_last_message_timestamp,
    o.last_message_event AS orig_last_message_event, 
    d.last_message_event AS denorm_last_message_event,
    o.csa_title AS orig_csa_title, 
    d.csa_title AS denorm_csa_title
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
JOIN comparison c ON o.id = c.id AND o.test_id = c.test_id
WHERE c.in_original AND c.in_denormalized AND NOT c.data_match
ORDER BY o.test_id, o.id
LIMIT 10;

-- Create a table to show specific mismatched fields
CREATE TEMPORARY TABLE field_mismatches AS
SELECT
    o.test_id,
    o.id,
    'customer_support_id' AS field_name,
    o.customer_support_id AS original_value,
    d.customer_support_id AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.customer_support_id IS DISTINCT FROM d.customer_support_id)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'customer_support_display_name' AS field_name,
    o.customer_support_display_name AS original_value,
    d.customer_support_display_name AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.customer_support_display_name IS DISTINCT FROM d.customer_support_display_name)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'last_message' AS field_name,
    o.last_message AS original_value,
    d.last_message AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.last_message IS DISTINCT FROM d.last_message)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'contacts_message' AS field_name,
    o.contacts_message AS original_value,
    d.contacts_message AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.contacts_message IS DISTINCT FROM d.contacts_message)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'last_message_timestamp' AS field_name,
    o.last_message_timestamp::text AS original_value,
    d.last_message_timestamp::text AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.last_message_timestamp IS DISTINCT FROM d.last_message_timestamp)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'last_message_event' AS field_name,
    o.last_message_event AS original_value,
    d.last_message_event AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.last_message_event IS DISTINCT FROM d.last_message_event)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'csa_title' AS field_name,
    o.csa_title AS original_value,
    d.csa_title AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.csa_title IS DISTINCT FROM d.csa_title)

UNION ALL

SELECT
    o.test_id,
    o.id,
    'received_from' AS field_name,
    o.received_from AS original_value,
    d.received_from AS denormalized_value
FROM original_query_results o
JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
WHERE (o.received_from IS DISTINCT FROM d.received_from);

-- Show field-specific mismatches
SELECT * FROM field_mismatches
ORDER BY field_mismatches.test_id, field_mismatches.id, field_name
LIMIT 50;

-- Make sure field_mismatches is created before attempting to select from it
-- Drop temporary tables when done
DROP TABLE IF EXISTS field_mismatches;
DROP TABLE IF EXISTS comparison;
DROP TABLE IF EXISTS denormalized_query_results;
DROP TABLE IF EXISTS original_query_results;
DROP TABLE IF EXISTS test_params;