-- Create temporary tables to store our test case IDs for both active and ended chats
CREATE TEMPORARY TABLE active_test_case_ids AS
WITH latest_chats AS (
    SELECT 
        base_id,
        ended,
        updated,
        ROW_NUMBER() OVER (PARTITION BY base_id ORDER BY updated DESC) as rn
    FROM chat
)
SELECT 
    lc.base_id,
    'ACTIVE' as chat_status
FROM latest_chats lc
INNER JOIN message m ON lc.base_id = m.chat_base_id
WHERE lc.rn = 1 
AND lc.ended IS NULL
GROUP BY lc.base_id, lc.updated
ORDER BY MAX(lc.updated) DESC
LIMIT 10; -- Limit to 10 active chats

CREATE TEMPORARY TABLE ended_test_case_ids AS
WITH latest_chats AS (
    SELECT 
        base_id,
        ended,
        updated,
        ROW_NUMBER() OVER (PARTITION BY base_id ORDER BY updated DESC) as rn
    FROM chat
)
SELECT 
    lc.base_id,
    'ENDED' as chat_status
FROM latest_chats lc
INNER JOIN message m ON lc.base_id = m.chat_base_id
WHERE lc.rn = 1 
AND lc.ended IS NOT NULL
GROUP BY lc.base_id, lc.updated
ORDER BY MAX(lc.updated) DESC
LIMIT 10; -- Limit to 10 ended chats

-- Combine active and ended test cases into a single table
CREATE TEMPORARY TABLE test_case_ids AS
SELECT base_id, chat_status FROM active_test_case_ids
UNION ALL
SELECT base_id, chat_status FROM ended_test_case_ids;

-- Create tables to store the results from both queries
CREATE TEMPORARY TABLE original_query_results (
    test_id SERIAL,
    id TEXT,
    chat_status TEXT,
    customer_support_id TEXT,
    customer_support_display_name TEXT,
    end_user_id TEXT,
    end_user_first_name TEXT,
    end_user_last_name TEXT,
    status TEXT,
    end_user_email TEXT,
    end_user_phone TEXT,
    end_user_os TEXT,
    end_user_url TEXT,
    feedback_text TEXT,
    feedback_rating INTEGER,
    created TIMESTAMP,
    updated TIMESTAMP,
    ended TIMESTAMP,
    external_id TEXT,
    forwarded_to TEXT,
    forwarded_to_name TEXT,
    received_from TEXT,
    received_from_name TEXT,
    last_message TEXT,
    last_message_timestamp TIMESTAMP,
    csa_title TEXT
);

CREATE TEMPORARY TABLE denormalized_query_results (
    test_id SERIAL,
    id TEXT,
    chat_status TEXT,
    customer_support_id TEXT,
    customer_support_display_name TEXT,
    end_user_id TEXT,
    end_user_first_name TEXT,
    end_user_last_name TEXT,
    status TEXT,
    end_user_email TEXT,
    end_user_phone TEXT,
    end_user_os TEXT,
    end_user_url TEXT,
    feedback_text TEXT,
    feedback_rating INTEGER,
    created TIMESTAMP,
    updated TIMESTAMP,
    ended TIMESTAMP,
    external_id TEXT,
    forwarded_to TEXT,
    forwarded_to_name TEXT,
    received_from TEXT,
    received_from_name TEXT,
    last_message TEXT,
    last_message_timestamp TIMESTAMP,
    csa_title TEXT
);

-- Run both queries for each test ID and insert results into respective tables
DO $$
DECLARE
    chat_id_record RECORD;
    test_counter INTEGER := 1;
BEGIN
    FOR chat_id_record IN SELECT base_id, chat_status FROM test_case_ids
    LOOP
        -- Run the original query
        EXECUTE 'INSERT INTO original_query_results (
            test_id, id, chat_status, customer_support_id, customer_support_display_name,
            end_user_id, end_user_first_name, end_user_last_name, status,
            end_user_email, end_user_phone, end_user_os, end_user_url,
            feedback_text, feedback_rating, created, updated, ended,
            external_id, forwarded_to, forwarded_to_name, received_from, 
            received_from_name, last_message, last_message_timestamp, csa_title
        )
        SELECT 
            $1, c.base_id AS id,
            $3 AS chat_status,
            c.customer_support_id,
            c.customer_support_display_name,
            c.end_user_id,
            c.end_user_first_name,
            c.end_user_last_name,
            c.status,
            c.end_user_email,
            c.end_user_phone,
            c.end_user_os,
            c.end_user_url,
            c.feedback_text,
            c.feedback_rating,
            c.created,
            c.updated,
            c.ended,
            c.external_id,
            c.forwarded_to,
            c.forwarded_to_name,
            c.received_from,
            c.received_from_name,
            m.content AS last_message,
            m.updated AS last_message_timestamp,
            (
                CASE
                    WHEN (
                        SELECT value
                        FROM configuration
                        WHERE
                            key = ''is_csa_title_visible''
                            AND deleted = FALSE
                        ORDER BY id DESC
                        LIMIT 1
                    ) = ''true'' THEN c.csa_title
                    ELSE ''''
                END
            ) AS csa_title
        FROM (
            SELECT
                base_id,
                customer_support_id,
                customer_support_display_name,
                csa_title,
                end_user_id,
                end_user_first_name,
                end_user_last_name,
                status,
                end_user_email,
                end_user_phone,
                end_user_os,
                end_user_url,
                feedback_text,
                feedback_rating,
                created,
                updated,
                ended,
                external_id,
                forwarded_to,
                forwarded_to_name,
                received_from,
                received_from_name
            FROM chat
            WHERE base_id = $2
            ORDER BY updated DESC
            LIMIT 1
        ) AS c
            INNER JOIN message AS m ON c.base_id = m.chat_base_id
        WHERE c.ended IS NULL        
        ORDER BY m.updated DESC
        LIMIT 1' 
        USING test_counter, chat_id_record.base_id, chat_id_record.chat_status;

        -- Run the denormalized query
        EXECUTE 'INSERT INTO denormalized_query_results (
            test_id, id, chat_status, customer_support_id, customer_support_display_name,
            end_user_id, end_user_first_name, end_user_last_name, status,
            end_user_email, end_user_phone, end_user_os, end_user_url,
            feedback_text, feedback_rating, created, updated, ended,
            external_id, forwarded_to, forwarded_to_name, received_from, 
            received_from_name, last_message, last_message_timestamp, csa_title
        )
        SELECT 
            $1, c.chat_id AS id,
            $3 AS chat_status,
            c.customer_support_id,
            c.customer_support_display_name,
            c.end_user_id,
            c.end_user_first_name,
            c.end_user_last_name,
            c.status,
            c.end_user_email,
            c.end_user_phone,
            c.end_user_os,
            c.end_user_url,
            c.feedback_text,
            c.feedback_rating,
            c.created,
            c.updated,
            c.ended,
            c.external_id,
            c.forwarded_to,
            c.forwarded_to_name,
            c.received_from,
            c.received_from_name,
            c.last_message_including_empty_content,
            c.last_message_timestamp,
            c.csa_title
        FROM denormalized_chat c
        WHERE chat_id = $2
        ORDER BY denormalized_record_created DESC
        LIMIT 1'
        USING test_counter, chat_id_record.base_id, chat_id_record.chat_status;

        test_counter := test_counter + 1;
    END LOOP;
END $$;

-- Create a view to compare results column by column
CREATE TEMPORARY VIEW comparison_view AS
SELECT 
    o.test_id,
    o.id AS original_id,
    o.chat_status,
    d.id AS denormalized_id,
    o.id = d.id AS id_match,
    o.customer_support_id = d.customer_support_id AS customer_support_id_match,
    o.customer_support_display_name = d.customer_support_display_name AS customer_support_display_name_match,
    o.end_user_id = d.end_user_id AS end_user_id_match,
    o.end_user_first_name = d.end_user_first_name AS end_user_first_name_match,
    o.end_user_last_name = d.end_user_last_name AS end_user_last_name_match,
    o.status = d.status AS status_match,
    o.end_user_email = d.end_user_email AS end_user_email_match,
    o.end_user_phone = d.end_user_phone AS end_user_phone_match,
    o.end_user_os = d.end_user_os AS end_user_os_match,
    o.end_user_url = d.end_user_url AS end_user_url_match,
    o.feedback_text = d.feedback_text AS feedback_text_match,
    o.feedback_rating = d.feedback_rating AS feedback_rating_match,
    o.created = d.created AS created_match,
    o.updated = d.updated AS updated_match,
    o.ended = d.ended AS ended_match,
    o.external_id = d.external_id AS external_id_match,
    o.forwarded_to = d.forwarded_to AS forwarded_to_match, 
    o.forwarded_to_name = d.forwarded_to_name AS forwarded_to_name_match,
    o.received_from = d.received_from AS received_from_match,
    o.received_from_name = d.received_from_name AS received_from_name_match,
    o.last_message = d.last_message AS last_message_match,
    o.last_message_timestamp = d.last_message_timestamp AS last_message_timestamp_match,
    o.csa_title = d.csa_title AS csa_title_match
FROM original_query_results o
LEFT JOIN denormalized_query_results d ON o.test_id = d.test_id;

-- Create a table to summarize discrepancies by test case
CREATE TEMPORARY TABLE test_case_summary AS
SELECT 
    test_id,
    original_id,
    chat_status,
    denormalized_id,
    CASE WHEN original_id IS NULL THEN 'Missing in original query'
         WHEN denormalized_id IS NULL THEN 'Missing in denormalized query'
         ELSE 'IDs present in both queries'
    END AS record_status,
    -- Count mismatches in each row
    (CASE WHEN id_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN customer_support_id_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN customer_support_display_name_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_id_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_first_name_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_last_name_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN status_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_email_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_phone_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_os_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN end_user_url_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN feedback_text_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN feedback_rating_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN created_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN updated_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN ended_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN external_id_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN forwarded_to_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN forwarded_to_name_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN received_from_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN received_from_name_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN last_message_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN last_message_timestamp_match = FALSE THEN 1 ELSE 0 END +
     CASE WHEN csa_title_match = FALSE THEN 1 ELSE 0 END
    ) AS total_mismatches
FROM comparison_view;

-- Create detailed report of mismatched fields
CREATE TEMPORARY TABLE mismatch_details AS
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'customer_support_id' AS field_name,
    o.customer_support_id AS original_value,
    d.customer_support_id AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.customer_support_id_match = FALSE
UNION ALL
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'customer_support_display_name' AS field_name,
    o.customer_support_display_name AS original_value,
    d.customer_support_display_name AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.customer_support_display_name_match = FALSE
UNION ALL
-- Continue with all fields that might mismatch
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'end_user_id' AS field_name,
    o.end_user_id AS original_value,
    d.end_user_id AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.end_user_id_match = FALSE
UNION ALL
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'last_message' AS field_name,
    o.last_message AS original_value,
    d.last_message AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.last_message_match = FALSE
UNION ALL
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'last_message_timestamp' AS field_name,
    o.last_message_timestamp::TEXT AS original_value,
    d.last_message_timestamp::TEXT AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.last_message_timestamp_match = FALSE
UNION ALL
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'csa_title' AS field_name,
    o.csa_title AS original_value,
    d.csa_title AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.csa_title_match = FALSE
UNION ALL
SELECT 
    cv.test_id,
    cv.original_id,
    cv.chat_status,
    'ended' AS field_name,
    o.ended::TEXT AS original_value,
    d.ended::TEXT AS denormalized_value
FROM comparison_view cv
JOIN original_query_results o ON cv.test_id = o.test_id
JOIN denormalized_query_results d ON cv.test_id = d.test_id
WHERE cv.ended_match = FALSE;

-- Generate overall test summary
SELECT 
    COUNT(*) AS total_test_cases,
    SUM(CASE WHEN record_status = 'IDs present in both queries' AND total_mismatches = 0 THEN 1 ELSE 0 END) AS passed_tests,
    SUM(CASE WHEN record_status != 'IDs present in both queries' OR total_mismatches > 0 THEN 1 ELSE 0 END) AS failed_tests,
    (SUM(CASE WHEN record_status = 'IDs present in both queries' AND total_mismatches = 0 THEN 1 ELSE 0 END)::FLOAT / 
     GREATEST(COUNT(*), 1)::FLOAT) * 100 AS pass_percentage
FROM test_case_summary;

-- Display test case details with chat status
SELECT 
    test_id,
    original_id,
    chat_status,
    record_status,
    total_mismatches,
    CASE 
        WHEN record_status = 'IDs present in both queries' AND total_mismatches = 0 
        THEN 'PASS' 
        ELSE 'FAIL' 
    END AS test_result
FROM test_case_summary
ORDER BY chat_status, test_id;

-- Show detailed field mismatches for failed tests
SELECT 
    md.test_id,
    md.original_id,
    md.chat_status,
    md.field_name,
    md.original_value,
    md.denormalized_value
FROM mismatch_details md
JOIN test_case_summary tcs ON md.test_id = tcs.test_id
WHERE tcs.total_mismatches > 0
ORDER BY md.chat_status, md.test_id, md.field_name;

-- Show statistics on most common mismatches by chat status
SELECT 
    chat_status,
    field_name,
    COUNT(*) AS mismatch_count,
    (COUNT(*)::FLOAT / 
     GREATEST((SELECT COUNT(*) FROM test_case_summary WHERE total_mismatches > 0 AND chat_status = md.chat_status), 1)::FLOAT) * 100 AS percentage_of_failures
FROM mismatch_details md
GROUP BY chat_status, field_name
ORDER BY chat_status, mismatch_count DESC;

-- Show overall test result (PASS/FAIL) broken down by chat status
SELECT 
    chat_status,
    COUNT(*) AS total_cases,
    SUM(CASE WHEN record_status = 'IDs present in both queries' AND total_mismatches = 0 THEN 1 ELSE 0 END) AS passed,
    SUM(CASE WHEN record_status != 'IDs present in both queries' OR total_mismatches > 0 THEN 1 ELSE 0 END) AS failed,
    (SUM(CASE WHEN record_status = 'IDs present in both queries' AND total_mismatches = 0 THEN 1 ELSE 0 END)::FLOAT / 
     GREATEST(COUNT(*), 1)::FLOAT) * 100 AS pass_percentage,
    CASE 
        WHEN SUM(CASE WHEN record_status != 'IDs present in both queries' OR total_mismatches > 0 THEN 1 ELSE 0 END) > 0
        THEN 'FAIL' 
        ELSE 'PASS' 
    END AS status
FROM test_case_summary
GROUP BY chat_status
ORDER BY chat_status;

-- Show overall test result (PASS/FAIL)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM test_case_summary 
            WHERE record_status != 'IDs present in both queries' OR total_mismatches > 0
        ) 
        THEN 'FAIL: Queries return different results'
        ELSE 'PASS: Queries return identical results'
    END AS overall_test_result;

-- Cleanup tables (using DROP CASCADE to handle dependencies)
DROP TABLE IF EXISTS active_test_case_ids;
DROP TABLE IF EXISTS ended_test_case_ids;
DROP TABLE IF EXISTS test_case_ids;
DROP VIEW IF EXISTS comparison_view CASCADE;
DROP TABLE IF EXISTS original_query_results CASCADE;
DROP TABLE IF EXISTS denormalized_query_results CASCADE;
DROP TABLE IF EXISTS test_case_summary;
DROP TABLE IF EXISTS mismatch_details;