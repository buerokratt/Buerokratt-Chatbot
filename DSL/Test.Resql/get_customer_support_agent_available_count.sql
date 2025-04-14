-- This script compares the results of two COUNT queries
-- Designed for PostgreSQL

-- Run the first count query
SELECT
    'Query 1' AS query_name,
    COUNT(id) AS count_result
FROM customer_support_agent_activity
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(c_2.id) FROM customer_support_agent_activity AS c_2
        GROUP BY c_2.id_code
    );

-- Run the second count query
SELECT
    'Query 2' AS query_name,
    COUNT(id) AS count_result
FROM denorm_user_csa_authority_profile_settings
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(d.id) FROM denorm_user_csa_authority_profile_settings AS d
        GROUP BY d.id_code
    );

-- Create temporary tables for detailed comparison
CREATE TEMPORARY TABLE csaa_results AS
SELECT
    id_code,
    id,
    status
FROM customer_support_agent_activity
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(c_2.id) FROM customer_support_agent_activity AS c_2
        GROUP BY c_2.id_code
    );

CREATE TEMPORARY TABLE ducaps_results AS
SELECT
    id_code,
    id,
    status
FROM denorm_user_csa_authority_profile_settings
WHERE
    (status = 'online' OR status = 'idle')
    AND id IN (
        SELECT MAX(d.id) FROM denorm_user_csa_authority_profile_settings AS d
        GROUP BY d.id_code
    );

-- Compare record counts
SELECT
    'Total records comparison' AS comparison_type,
    (SELECT COUNT(*) FROM csaa_results) AS csaa_count,
    (SELECT COUNT(*) FROM ducaps_results) AS ducaps_count,
    (SELECT COUNT(*) FROM csaa_results) - (SELECT COUNT(*) FROM ducaps_results) AS difference;

-- Find records in first query but not in second
CREATE TEMPORARY TABLE in_csaa_only AS
SELECT
    c.id_code,
    c.id,
    c.status
FROM csaa_results AS c
    LEFT JOIN ducaps_results AS d ON c.id_code = d.id_code
WHERE d.id_code IS NULL;

-- Find records in second query but not in first
CREATE TEMPORARY TABLE in_ducaps_only AS
SELECT
    d.id_code,
    d.id,
    d.status
FROM ducaps_results AS d
    LEFT JOIN csaa_results AS c ON d.id_code = c.id_code
WHERE c.id_code IS NULL;

-- Show counts of unique records
SELECT
    'Records only in CSAA' AS unique_records,
    COUNT(*) AS count
FROM in_csaa_only
UNION ALL
SELECT
    'Records only in DUCAPS' AS unique_records,
    COUNT(*) AS count
FROM in_ducaps_only;

-- Show sample of records only in first query
SELECT
    'Sample records only in CSAA' AS sample_type,
    id_code,
    id,
    status
FROM in_csaa_only
LIMIT 10;

-- Show sample of records only in second query
SELECT
    'Sample records only in DUCAPS' AS sample_type,
    id_code,
    id,
    status
FROM in_ducaps_only
LIMIT 10;

-- Check for inconsistent statuses between common records
SELECT
    'Status inconsistencies' AS inconsistency_type,
    c.id_code,
    c.status AS csaa_status,
    d.status AS ducaps_status
FROM csaa_results AS c
    INNER JOIN ducaps_results AS d ON c.id_code = d.id_code
WHERE c.status <> d.status
LIMIT 10;

-- Create a temporary table to store test results
CREATE TEMPORARY TABLE test_result AS
SELECT
    (
        (SELECT COUNT(*) FROM csaa_results) = (SELECT COUNT(*) FROM ducaps_results)
        AND (SELECT COUNT(*) FROM in_csaa_only) = 0
        AND (SELECT COUNT(*) FROM in_ducaps_only) = 0
        AND NOT EXISTS (
            SELECT 1
            FROM csaa_results AS c
                INNER JOIN ducaps_results AS d ON c.id_code = d.id_code
            WHERE c.status <> d.status
        )
    ) AS queries_match;

-- Output final test result (PASS/FAIL)
SELECT
    CASE
        WHEN queries_match THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result
FROM test_result;

-- Clean up
DROP TABLE csaa_results;
DROP TABLE ducaps_results;
DROP TABLE in_csaa_only;
DROP TABLE in_ducaps_only;
DROP TABLE test_result;
