-- This script generates random test cases and compares the results of both queries
-- Designed for PostgreSQL

-- First, let's create a temporary table to store our test cases
CREATE TEMPORARY TABLE test_cases (
    test_id SERIAL PRIMARY KEY,
    user_id_code TEXT,
    statuses STATUS []
);

-- Populate the test cases with random samples from the database
-- We'll generate 100 random test cases
INSERT INTO test_cases (user_id_code, statuses)
SELECT
    u.id_code,
    ARRAY(
        SELECT status::STATUS
        FROM (
            SELECT DISTINCT customer_support_agent_activity.status
            FROM customer_support_agent_activity
            WHERE customer_support_agent_activity.id_code = u.id_code
        ) AS distinct_statuses
        ORDER BY RANDOM()
        LIMIT GREATEST(1, FLOOR(RANDOM() * 3)::INTEGER + 1) -- Random 1-3 statuses
    )
FROM "user" AS u
WHERE
    EXISTS (
        SELECT 1
        FROM customer_support_agent_activity
        WHERE id_code = u.id_code
    )
ORDER BY RANDOM()
LIMIT 100;

-- Create temporary tables to store results from both queries
CREATE TEMPORARY TABLE query_1_results (
    test_id INTEGER,
    user_id_code TEXT
);

CREATE TEMPORARY TABLE query_2_results (
    test_id INTEGER,
    user_id_code TEXT
);

-- Function to run the tests
DO $$
DECLARE
    test_rec RECORD;
BEGIN
    -- For each test case, run both queries and store results
    FOR test_rec IN SELECT * FROM test_cases LOOP
        -- First query
        INSERT INTO query_1_results (test_id, user_id_code)
        SELECT 
            test_rec.test_id,
            u.id_code
        FROM "user" AS u
            INNER JOIN customer_support_agent_activity AS csaa ON u.id_code = csaa.id_code
        WHERE
            u.id_code = test_rec.user_id_code
            AND u.status <> 'deleted'
            AND u.id IN (
                SELECT MAX(u_2.id) FROM "user" AS u_2
                WHERE u_2.id_code = test_rec.user_id_code
            )
            AND csaa.status = ANY(test_rec.statuses)
            AND csaa.id IN (
                SELECT MAX(csaa_2.id) FROM customer_support_agent_activity AS csaa_2
                WHERE csaa_2.id_code = test_rec.user_id_code
            );

        -- Second query
        INSERT INTO query_2_results (test_id, user_id_code)
        SELECT
            test_rec.test_id,
            id_code
        FROM denorm_user_csa_authority_profile_settings
        WHERE
            id_code = test_rec.user_id_code
            AND user_status <> 'deleted'
            AND status = ANY(:statuses::STATUS [])
        ORDER BY id DESC
        LIMIT 1;
    END LOOP;
END $$;

-- Analyze the results
SELECT
    'Total test cases' AS metric,
    COUNT(*) AS value
FROM test_cases
UNION ALL
SELECT
    'Query 1 results' AS metric,
    COUNT(*) AS value
FROM query_1_results
UNION ALL
SELECT
    'Query 2 results' AS metric,
    COUNT(*) AS value
FROM query_2_results;

-- Create a combined results table for easier analysis
CREATE TEMPORARY TABLE combined_results AS
SELECT
    tc.test_id,
    tc.user_id_code,
    tc.statuses,
    q_1.user_id_code IS NOT NULL AS in_query_1,
    q_2.user_id_code IS NOT NULL AS in_query_2,
    CASE
        WHEN
            (q_1.user_id_code IS NOT NULL AND q_2.user_id_code IS NOT NULL)
            OR (q_1.user_id_code IS NULL AND q_2.user_id_code IS NULL)
            THEN 'Results Match'
        WHEN
            q_1.user_id_code IS NOT NULL AND q_2.user_id_code IS NULL
            THEN 'Only in Query 1'
        WHEN
            q_1.user_id_code IS NULL AND q_2.user_id_code IS NOT NULL
            THEN 'Only in Query 2'
    END AS result
FROM test_cases AS tc
    LEFT JOIN query_1_results AS q_1 ON tc.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON tc.test_id = q_2.test_id;

-- Find test cases where results differ
SELECT
    test_id,
    user_id_code,
    statuses,
    result
FROM combined_results
WHERE result <> 'Results Match';

-- Summary of discrepancies
SELECT
    'Matching results' AS result_type,
    COUNT(*) AS count
FROM combined_results
WHERE result = 'Results Match'
UNION ALL
SELECT
    'Only in Query 1' AS result_type,
    COUNT(*) AS count
FROM combined_results
WHERE result = 'Only in Query 1'
UNION ALL
SELECT
    'Only in Query 2' AS result_type,
    COUNT(*) AS count
FROM combined_results
WHERE result = 'Only in Query 2';

-- Create test result table to determine if test passes or fails
CREATE TEMPORARY TABLE test_result AS
SELECT
    COALESCE((
        (
            SELECT COUNT(*) FROM combined_results
            WHERE result <> 'Results Match'
        ) = 0
    ), FALSE) AS queries_match;

-- Output final test result (PASS/FAIL)
SELECT
    CASE
        WHEN
            queries_match
            THEN 'PASS: Queries return identical results for all test cases'
        ELSE 'FAIL: Queries return different results for some test cases'
    END AS test_result,
    (
        SELECT COUNT(*) FROM combined_results
        WHERE result <> 'Results Match'
    ) AS different_results_count
FROM test_result;

-- Clean up
DROP TABLE test_cases;
DROP TABLE query_1_results;
DROP TABLE query_2_results;
DROP TABLE combined_results;
DROP TABLE test_result;
