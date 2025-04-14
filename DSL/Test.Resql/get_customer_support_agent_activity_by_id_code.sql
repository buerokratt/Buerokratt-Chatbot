-- This script generates random test cases and compares the results of both queries
-- Designed for PostgreSQL

-- First, let's create temporary tables to store our test cases and results
CREATE TEMPORARY TABLE test_cases (
    test_id SERIAL PRIMARY KEY,
    customer_support_id TEXT
);

CREATE TEMPORARY TABLE query_1_results (
    test_id INTEGER,
    id_code TEXT,
    active BOOLEAN,
    status TEXT
);

CREATE TEMPORARY TABLE query_2_results (
    test_id INTEGER,
    id_code TEXT,
    active BOOLEAN,
    status TEXT
);

-- Populate the test cases with random samples from the database
-- We'll generate 100 random test cases
INSERT INTO test_cases (customer_support_id)
SELECT id_code FROM (
    SELECT DISTINCT id_code
    FROM customer_support_agent_activity
) AS distinct_ids
ORDER BY RANDOM()
LIMIT 100;

-- Function to run the tests
DO $$
DECLARE
    test_rec RECORD;
BEGIN
    -- For each test case, run both queries and store results
    FOR test_rec IN SELECT * FROM test_cases LOOP
        -- First query
        INSERT INTO query_1_results (test_id, id_code, active, status)
        SELECT 
            test_rec.test_id,
            id_code,
            active,
            status
        FROM customer_support_agent_activity
        WHERE
            id_code = test_rec.customer_support_id
            AND id IN (
                SELECT MAX(c_2.id) FROM customer_support_agent_activity AS c_2
                WHERE c_2.id_code = test_rec.customer_support_id
            );

        -- Second query
        INSERT INTO query_2_results (test_id, id_code, active, status)
        SELECT
            test_rec.test_id,
            id_code,
            active,
            status
        FROM denorm_user_csa_authority_profile_settings
        WHERE
            id_code = test_rec.customer_support_id
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

-- Create a temporary table for combined results
CREATE TEMPORARY TABLE combined_results AS
SELECT
    tc.test_id,
    tc.customer_support_id,
    q_1.id_code AS q_1_id_code,
    q_1.active AS q_1_active,
    q_1.status AS q_1_status,
    q_2.id_code AS q_2_id_code,
    q_2.active AS q_2_active,
    q_2.status AS q_2_status,
    CASE
        WHEN q_1.id_code IS NULL AND q_2.id_code IS NULL THEN 'Both Empty'
        WHEN q_1.id_code IS NULL THEN 'Only in Query 2'
        WHEN q_2.id_code IS NULL THEN 'Only in Query 1'
        WHEN q_1.active <> q_2.active OR q_1.status <> q_2.status THEN 'Values Differ'
        ELSE 'Identical'
    END AS result
FROM test_cases AS tc
    LEFT JOIN query_1_results AS q_1 ON tc.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON tc.test_id = q_2.test_id;

-- Find test cases where results differ
SELECT *
FROM combined_results
WHERE result <> 'Identical';

-- Detailed comparison of differences
SELECT
    cr.test_id,
    cr.customer_support_id,
    'id_code' AS field,
    COALESCE(cr.q_1_id_code::TEXT, 'NULL') AS query_1_value,
    COALESCE(cr.q_2_id_code::TEXT, 'NULL') AS query_2_value
FROM combined_results AS cr
WHERE
    cr.result <> 'Identical'
    AND (
        (cr.q_1_id_code IS NULL AND cr.q_2_id_code IS NOT NULL)
        OR (cr.q_1_id_code IS NOT NULL AND cr.q_2_id_code IS NULL)
        OR (cr.q_1_id_code <> cr.q_2_id_code)
    )
UNION ALL
SELECT
    cr.test_id,
    cr.customer_support_id,
    'active' AS field,
    COALESCE(cr.q_1_active::TEXT, 'NULL') AS query_1_value,
    COALESCE(cr.q_2_active::TEXT, 'NULL') AS query_2_value
FROM combined_results AS cr
WHERE
    cr.result <> 'Identical'
    AND (
        (cr.q_1_active IS NULL AND cr.q_2_active IS NOT NULL)
        OR (cr.q_1_active IS NOT NULL AND cr.q_2_active IS NULL)
        OR (cr.q_1_active <> cr.q_2_active)
    )
UNION ALL
SELECT
    cr.test_id,
    cr.customer_support_id,
    'status' AS field,
    COALESCE(cr.q_1_status, 'NULL') AS query_1_value,
    COALESCE(cr.q_2_status, 'NULL') AS query_2_value
FROM combined_results AS cr
WHERE
    cr.result <> 'Identical'
    AND (
        (cr.q_1_status IS NULL AND cr.q_2_status IS NOT NULL)
        OR (cr.q_1_status IS NOT NULL AND cr.q_2_status IS NULL)
        OR (cr.q_1_status <> cr.q_2_status)
    );

-- Summary of discrepancies
SELECT
    result AS result_type,
    COUNT(*) AS count
FROM combined_results
GROUP BY result
ORDER BY
    CASE
        WHEN result = 'Identical' THEN 1
        ELSE 2
    END,
    count DESC;

-- Create a temporary table to store test results
CREATE TEMPORARY TABLE test_result AS
SELECT
    (
        NOT EXISTS (
            SELECT 1
            FROM combined_results
            WHERE result <> 'Identical'
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
DROP TABLE test_cases;
DROP TABLE query_1_results;
DROP TABLE query_2_results;
DROP TABLE combined_results;
DROP TABLE test_result;
