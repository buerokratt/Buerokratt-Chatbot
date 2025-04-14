-- Test script to compare original user authority query with denormalized table query
-- This script generates random test id_codes and compares the results of both queries

-- First, let's create temporary tables to store our test cases and results
CREATE TEMPORARY TABLE test_cases (
    test_id SERIAL PRIMARY KEY,
    user_id_code TEXT
);

CREATE TEMPORARY TABLE query_1_results (
    test_id INTEGER,
    user_id_code TEXT,
    authorities TEXT []
);

CREATE TEMPORARY TABLE query_2_results (
    test_id INTEGER,
    user_id_code TEXT,
    authorities TEXT []
);

-- Populate the test cases with random id_codes from the database
-- We'll generate 100 random test cases (or fewer if there aren't enough users)
INSERT INTO test_cases (user_id_code)
SELECT id_code FROM (
    SELECT DISTINCT id_code
    FROM "user"
    WHERE status <> 'deleted'
) AS distinct_id_codes
ORDER BY RANDOM()
LIMIT 100;

-- Function to run the tests
DO $$
DECLARE
    test_rec RECORD;
    test_id_code TEXT;
BEGIN
    -- For each test case, run both queries and store results
    FOR test_rec IN SELECT * FROM test_cases LOOP
        test_id_code := test_rec.user_id_code;
        
        -- First query (original query)
        INSERT INTO query_1_results (
            test_id, user_id_code, authorities
        )
        SELECT 
            test_rec.test_id,
            test_id_code,
            ua.authority_name AS authorities
        FROM "user" AS u
            INNER JOIN (
                SELECT
                    ua.authority_name,
                    ua.user_id
                FROM user_authority AS ua
                WHERE ua.id IN (
                    SELECT MAX(id)
                    FROM user_authority
                    GROUP BY user_id
                )
            ) AS ua ON u.id_code = ua.user_id
        WHERE
            u.id_code = test_id_code
            AND status <> 'deleted'
            AND id IN (
                SELECT MAX(id) FROM "user"
                WHERE id_code = test_id_code
            );

        -- Second query (new denormalized query)
        INSERT INTO query_2_results (
            test_id, user_id_code, authorities
        )
        SELECT test_rec.test_id, test_id_code, authority_name AS authorities
        FROM denorm_user_csa_authority_profile_settings
        WHERE
            id_code = test_id_code
            AND user_status <> 'deleted'
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
    tc.user_id_code,
    q_1.authorities IS NOT NULL AS q_1_has_result,
    q_2.authorities IS NOT NULL AS q_2_has_result,
    (
        q_1.authorities = q_2.authorities
        OR (q_1.authorities IS NULL AND q_2.authorities IS NULL)
    ) AS authorities_match,
    CASE
        WHEN q_1.authorities IS NULL AND q_2.authorities IS NULL THEN 'Both Empty'
        WHEN q_1.authorities IS NULL THEN 'Only in Query 2'
        WHEN q_2.authorities IS NULL THEN 'Only in Query 1'
        WHEN q_1.authorities = q_2.authorities THEN 'Identical'
        ELSE 'Values Differ'
    END AS result
FROM test_cases AS tc
    LEFT JOIN query_1_results AS q_1 ON tc.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON tc.test_id = q_2.test_id;

-- Find test cases where results differ
SELECT
    test_id,
    user_id_code,
    result
FROM combined_results
WHERE result <> 'Identical';

-- Detailed comparison of differences
SELECT
    cr.test_id,
    cr.user_id_code,
    'authorities' AS field,
    q_1.authorities::TEXT AS query_1_value,
    q_2.authorities::TEXT AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.authorities IS NULL AND q_2.authorities IS NOT NULL)
        OR (q_1.authorities IS NOT NULL AND q_2.authorities IS NULL)
        OR (
            q_1.authorities IS NOT NULL
            AND q_2.authorities IS NOT NULL
            AND q_1.authorities <> q_2.authorities
        )
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
