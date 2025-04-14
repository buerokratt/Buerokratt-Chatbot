-- Test script to compare original user query with denormalized table query
-- This script generates random test id_codes and compares the results of both queries

-- First, let's create temporary tables to store our test cases and results
CREATE TEMPORARY TABLE test_cases (
    test_id SERIAL PRIMARY KEY,
    user_id_code TEXT
);

CREATE TEMPORARY TABLE query_1_results (
    test_id INTEGER,
    login TEXT,
    first_name TEXT,
    last_name TEXT,
    id_code TEXT,
    display_name TEXT,
    csa_title TEXT,
    csa_email TEXT,
    authorities TEXT []
);

CREATE TEMPORARY TABLE query_2_results (
    test_id INTEGER,
    login TEXT,
    first_name TEXT,
    last_name TEXT,
    id_code TEXT,
    display_name TEXT,
    csa_title TEXT,
    csa_email TEXT,
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
            test_id, login, first_name, last_name, id_code, 
            display_name, csa_title, csa_email, authorities
        )
        SELECT 
            test_rec.test_id,
            u.login,
            u.first_name,
            u.last_name,
            u.id_code,
            u.display_name,
            u.csa_title,
            u.csa_email,
            ua.authority_name AS authorities
        FROM "user" AS u
            LEFT JOIN (
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
            u.status <> 'deleted'
            AND u.id_code = test_id_code
            AND ARRAY_LENGTH(ua.authority_name, 1) > 0
            AND u.id IN (
                SELECT MAX(id) FROM "user"
                GROUP BY id_code
            );

        -- Second query (new denormalized query)
        INSERT INTO query_2_results (
            test_id, login, first_name, last_name, id_code, 
            display_name, csa_title, csa_email, authorities
        )
        SELECT
            test_rec.test_id,
            login,
            first_name,
            last_name,
            id_code,
            display_name,
            csa_title,
            csa_email,
            authority_name AS authorities
        FROM denorm_user_csa_authority_profile_settings
        WHERE
            user_status <> 'deleted'
            AND id_code = test_id_code
            AND ARRAY_LENGTH(authority_name, 1) > 0
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
    q_1.login IS NOT NULL AS q_1_has_result,
    q_2.login IS NOT NULL AS q_2_has_result,
    (q_1.login = q_2.login OR (q_1.login IS NULL AND q_2.login IS NULL)) AS login_match,
    (
        q_1.first_name = q_2.first_name
        OR (q_1.first_name IS NULL AND q_2.first_name IS NULL)
    ) AS first_name_match,
    (
        q_1.last_name = q_2.last_name
        OR (q_1.last_name IS NULL AND q_2.last_name IS NULL)
    ) AS last_name_match,
    (
        q_1.id_code = q_2.id_code OR (q_1.id_code IS NULL AND q_2.id_code IS NULL)
    ) AS id_code_match,
    (
        q_1.display_name = q_2.display_name
        OR (q_1.display_name IS NULL AND q_2.display_name IS NULL)
    ) AS display_name_match,
    (
        q_1.csa_title = q_2.csa_title
        OR (q_1.csa_title IS NULL AND q_2.csa_title IS NULL)
    ) AS csa_title_match,
    (
        q_1.csa_email = q_2.csa_email
        OR (q_1.csa_email IS NULL AND q_2.csa_email IS NULL)
    ) AS csa_email_match,
    (
        q_1.authorities = q_2.authorities
        OR (q_1.authorities IS NULL AND q_2.authorities IS NULL)
    ) AS authorities_match,
    CASE
        WHEN q_1.login IS NULL AND q_2.login IS NULL THEN 'Both Empty'
        WHEN q_1.login IS NULL THEN 'Only in Query 2'
        WHEN q_2.login IS NULL THEN 'Only in Query 1'
        WHEN
            q_1.login = q_2.login
            AND q_1.first_name = q_2.first_name
            AND q_1.last_name = q_2.last_name
            AND q_1.id_code = q_2.id_code
            AND q_1.display_name = q_2.display_name
            AND q_1.csa_title = q_2.csa_title
            AND q_1.csa_email = q_2.csa_email
            AND q_1.authorities = q_2.authorities THEN 'Identical'
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
    'login' AS field,
    q_1.login AS query_1_value,
    q_2.login AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.login IS NULL AND q_2.login IS NOT NULL)
        OR (q_1.login IS NOT NULL AND q_2.login IS NULL)
        OR (q_1.login IS NOT NULL AND q_2.login IS NOT NULL AND q_1.login <> q_2.login)
    )
UNION ALL
SELECT
    cr.test_id,
    cr.user_id_code,
    'first_name' AS field,
    q_1.first_name AS query_1_value,
    q_2.first_name AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.first_name IS NULL AND q_2.first_name IS NOT NULL)
        OR (q_1.first_name IS NOT NULL AND q_2.first_name IS NULL)
        OR (
            q_1.first_name IS NOT NULL
            AND q_2.first_name IS NOT NULL
            AND q_1.first_name <> q_2.first_name
        )
    )
UNION ALL
SELECT
    cr.test_id,
    cr.user_id_code,
    'last_name' AS field,
    q_1.last_name AS query_1_value,
    q_2.last_name AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.last_name IS NULL AND q_2.last_name IS NOT NULL)
        OR (q_1.last_name IS NOT NULL AND q_2.last_name IS NULL)
        OR (
            q_1.last_name IS NOT NULL
            AND q_2.last_name IS NOT NULL
            AND q_1.last_name <> q_2.last_name
        )
    )
UNION ALL
SELECT
    cr.test_id,
    cr.user_id_code,
    'id_code' AS field,
    q_1.id_code AS query_1_value,
    q_2.id_code AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.id_code IS NULL AND q_2.id_code IS NOT NULL)
        OR (q_1.id_code IS NOT NULL AND q_2.id_code IS NULL)
        OR (
            q_1.id_code IS NOT NULL
            AND q_2.id_code IS NOT NULL
            AND q_1.id_code <> q_2.id_code
        )
    )
UNION ALL
SELECT
    cr.test_id,
    cr.user_id_code,
    'display_name' AS field,
    q_1.display_name AS query_1_value,
    q_2.display_name AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.display_name IS NULL AND q_2.display_name IS NOT NULL)
        OR (q_1.display_name IS NOT NULL AND q_2.display_name IS NULL)
        OR (
            q_1.display_name IS NOT NULL
            AND q_2.display_name IS NOT NULL
            AND q_1.display_name <> q_2.display_name
        )
    )
UNION ALL
SELECT
    cr.test_id,
    cr.user_id_code,
    'csa_title' AS field,
    q_1.csa_title AS query_1_value,
    q_2.csa_title AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.csa_title IS NULL AND q_2.csa_title IS NOT NULL)
        OR (q_1.csa_title IS NOT NULL AND q_2.csa_title IS NULL)
        OR (
            q_1.csa_title IS NOT NULL
            AND q_2.csa_title IS NOT NULL
            AND q_1.csa_title <> q_2.csa_title
        )
    )
UNION ALL
SELECT
    cr.test_id,
    cr.user_id_code,
    'csa_email' AS field,
    q_1.csa_email AS query_1_value,
    q_2.csa_email AS query_2_value
FROM combined_results AS cr
    LEFT JOIN query_1_results AS q_1 ON cr.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON cr.test_id = q_2.test_id
WHERE
    cr.result <> 'Identical'
    AND (
        (q_1.csa_email IS NULL AND q_2.csa_email IS NOT NULL)
        OR (q_1.csa_email IS NOT NULL AND q_2.csa_email IS NULL)
        OR (
            q_1.csa_email IS NOT NULL
            AND q_2.csa_email IS NOT NULL
            AND q_1.csa_email <> q_2.csa_email
        )
    )
UNION ALL
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
