-- This script compares the results of two complex queries
-- Designed for PostgreSQL

-- Create temporary tables to store the results from both queries
CREATE TEMPORARY TABLE query_1_results AS
WITH
    max_user_profile_settings AS (
        SELECT MAX(id) AS max_id
        FROM user_profile_settings
        GROUP BY user_id
    ),

    user_profile_settings AS (
        SELECT
            user_id,
            new_chat_email_notifications
        FROM user_profile_settings
            INNER JOIN max_user_profile_settings ON id = max_id
    )

SELECT
    id_code,
    active,
    status
FROM customer_support_agent_activity AS csaa
    INNER JOIN user_profile_settings AS ups ON csaa.id_code = ups.user_id
WHERE
    (status = 'online' OR status = 'idle')
    AND ups.new_chat_email_notifications
    AND csaa.id IN (
        SELECT MAX(id) FROM customer_support_agent_activity
        GROUP BY id_code
    );

CREATE TEMPORARY TABLE query_2_results AS
SELECT
    id_code,
    active,
    status
FROM denorm_user_csa_authority_profile_settings
WHERE
    (status = 'online' OR status = 'idle')
    AND new_chat_email_notifications = true
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        GROUP BY id_code
    );

-- Compare record counts
SELECT 
    'Query 1 (CSAA with User Profile)' AS source,
    COUNT(*) AS record_count
FROM query_1_results
UNION ALL
SELECT 
    'Query 2 (Denormalized)' AS source,
    COUNT(*) AS record_count
FROM query_2_results;

-- Create a combined results table for comparison
CREATE TEMPORARY TABLE combined_results AS
SELECT
    COALESCE(q1.id_code, q2.id_code) AS id_code,
    q1.id_code IS NOT NULL AS in_query_1,
    q2.id_code IS NOT NULL AS in_query_2,
    q1.active AS q1_active,
    q1.status AS q1_status,
    q2.active AS q2_active,
    q2.status AS q2_status,
    CASE
        WHEN q1.id_code IS NULL THEN 'Only in Query 2'
        WHEN q2.id_code IS NULL THEN 'Only in Query 1'
        WHEN q1.active IS DISTINCT FROM q2.active OR q1.status IS DISTINCT FROM q2.status THEN 'Field Values Differ'
        ELSE 'Identical'
    END AS comparison_result
FROM query_1_results q1
FULL OUTER JOIN query_2_results q2 ON q1.id_code = q2.id_code;

-- Find records that differ
SELECT *
FROM combined_results
WHERE comparison_result <> 'Identical'
ORDER BY id_code;

-- Detailed field-level comparison for records with differing values
SELECT
    id_code,
    'active' AS field_name,
    q1_active::TEXT AS query_1_value,
    q2_active::TEXT AS query_2_value
FROM combined_results
WHERE comparison_result = 'Field Values Differ'
    AND q1_active IS DISTINCT FROM q2_active
UNION ALL
SELECT
    id_code,
    'status' AS field_name,
    q1_status::TEXT AS query_1_value,
    q2_status::TEXT AS query_2_value
FROM combined_results
WHERE comparison_result = 'Field Values Differ'
    AND q1_status IS DISTINCT FROM q2_status
ORDER BY id_code, field_name;

-- Summary of comparison results
SELECT
    comparison_result,
    COUNT(*) AS record_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM combined_results) = 0 THEN 0  -- Handle empty results case
        ELSE ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM combined_results), 2)
    END AS percentage
FROM combined_results
GROUP BY comparison_result
ORDER BY
    CASE 
        WHEN comparison_result = 'Identical' THEN 1
        ELSE 2
    END,
    record_count DESC;

-- Sample of records only in Query 1
SELECT id_code, active, status, 'Only in Query 1' AS note
FROM query_1_results
WHERE id_code NOT IN (SELECT id_code FROM query_2_results)
ORDER BY id_code
LIMIT 10;

-- Sample of records only in Query 2
SELECT id_code, active, status, 'Only in Query 2' AS note
FROM query_2_results
WHERE id_code NOT IN (SELECT id_code FROM query_1_results)
ORDER BY id_code
LIMIT 10;

-- Create test result table to determine if test passes or fails
CREATE TEMPORARY TABLE test_result AS
SELECT 
    CASE
        WHEN (
            (SELECT COUNT(*) FROM combined_results WHERE comparison_result <> 'Identical') = 0
        ) THEN TRUE
        ELSE FALSE
    END AS queries_match,
    (SELECT COUNT(*) FROM combined_results) AS total_count;  -- Add total count for reference

-- Output final test result (PASS/FAIL) with division by zero protection
SELECT 
    CASE 
        WHEN queries_match THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result,
    (SELECT COUNT(*) FROM combined_results WHERE comparison_result <> 'Identical') AS different_records_count,
    total_count AS total_records_count,
    CASE 
        WHEN total_count = 0 THEN NULL  -- Return NULL instead of dividing by zero
        ELSE ROUND(100.0 * (SELECT COUNT(*) FROM combined_results WHERE comparison_result = 'Identical') / total_count, 2)
    END AS match_percentage
FROM test_result;

-- Clean up
DROP TABLE query_1_results;
DROP TABLE query_2_results;
DROP TABLE combined_results;
DROP TABLE test_result;