-- This script compares the results of two queries that select online support agents
-- Designed for PostgreSQL

-- Create temporary tables to store the results from both queries
CREATE TEMPORARY TABLE query_1_results AS
SELECT
    id_code,
    active,
    status
FROM customer_support_agent_activity
WHERE
    (status = 'online')
    AND id IN (
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
    (status = 'online')
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        GROUP BY id_code
    );

-- Compare record counts
SELECT
    'Query 1 (CSAA)' AS source,
    COUNT(*) AS record_count
FROM query_1_results
UNION ALL
SELECT
    'Query 2 (DUCAPS)' AS source,
    COUNT(*) AS record_count
FROM query_2_results;

-- Create a combined results table for comparison
CREATE TEMPORARY TABLE combined_results AS
SELECT
    q_1.active AS q_1_active,
    q_1.status AS q_1_status,
    q_2.active AS q_2_active,
    q_2.status AS q_2_status,
    COALESCE(q_1.id_code, q_2.id_code) AS id_code,
    q_1.id_code IS NOT NULL AS in_query_1,
    q_2.id_code IS NOT NULL AS in_query_2,
    CASE
        WHEN q_1.id_code IS NULL THEN 'Only in Query 2'
        WHEN q_2.id_code IS NULL THEN 'Only in Query 1'
        WHEN
            q_1.active <> q_2.active OR q_1.status <> q_2.status
            THEN 'Field Values Differ'
        ELSE 'Identical'
    END AS comparison_result
FROM query_1_results AS q_1
    FULL OUTER JOIN query_2_results AS q_2 ON q_1.id_code = q_2.id_code;

-- Find records that differ
SELECT *
FROM combined_results
WHERE comparison_result <> 'Identical';

-- Detailed field-level comparison for records with differing values
SELECT
    id_code,
    'active' AS field_name,
    q_1_active::TEXT AS query_1_value,
    q_2_active::TEXT AS query_2_value
FROM combined_results
WHERE
    comparison_result = 'Field Values Differ'
    AND q_1_active IS DISTINCT FROM q_2_active
UNION ALL
SELECT
    id_code,
    'status' AS field_name,
    q_1_status::TEXT AS query_1_value,
    q_2_status::TEXT AS query_2_value
FROM combined_results
WHERE
    comparison_result = 'Field Values Differ'
    AND q_1_status IS DISTINCT FROM q_2_status;

-- Summary of comparison results
SELECT
    comparison_result,
    COUNT(*) AS record_count
FROM combined_results
GROUP BY comparison_result
ORDER BY
    CASE
        WHEN comparison_result = 'Identical' THEN 1
        ELSE 2
    END,
    record_count DESC;

-- Create test result table to determine if test passes or fails
CREATE TEMPORARY TABLE test_result AS
SELECT
    COALESCE((
        (
            SELECT COUNT(*) FROM combined_results
            WHERE comparison_result <> 'Identical'
        )
        = 0
    ), FALSE) AS queries_match;

-- Output final test result (PASS/FAIL)
SELECT
    CASE
        WHEN queries_match THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result,
    (
        SELECT COUNT(*) FROM combined_results
        WHERE comparison_result <> 'Identical'
    ) AS different_records_count,
    (SELECT COUNT(*) FROM combined_results) AS total_records_count
FROM test_result;

-- Clean up
DROP TABLE query_1_results;
DROP TABLE query_2_results;
DROP TABLE combined_results;
DROP TABLE test_result;
