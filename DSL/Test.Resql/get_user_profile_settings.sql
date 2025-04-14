-- This script generates random test cases and compares the results of the original and new queries
-- Designed for PostgreSQL

-- First, let's create a temporary table to store our test cases
CREATE TEMPORARY TABLE test_cases (
    test_id SERIAL PRIMARY KEY,
    user_id TEXT
);

-- Populate the test cases with random samples from the database
-- We'll generate 100 random test cases
INSERT INTO test_cases (user_id)
SELECT DISTINCT user_id
FROM user_profile_settings
ORDER BY RANDOM()
LIMIT 100;

-- If we have fewer than 100 distinct users, get as many as we can
INSERT INTO test_cases (user_id)
SELECT DISTINCT id_code
FROM denorm_user_csa_authority_profile_settings
WHERE id_code NOT IN (SELECT user_id FROM test_cases)
ORDER BY RANDOM()
LIMIT 100 - (SELECT COUNT(*) FROM test_cases);

-- Create temporary tables to store results from both queries
CREATE TEMPORARY TABLE query_1_results (
    test_id INTEGER,
    user_id TEXT,
    forwarded_chat_popup_notifications BOOLEAN,
    forwarded_chat_sound_notifications BOOLEAN,
    forwarded_chat_email_notifications BOOLEAN,
    new_chat_popup_notifications BOOLEAN,
    new_chat_sound_notifications BOOLEAN,
    new_chat_email_notifications BOOLEAN,
    use_autocorrect BOOLEAN
);

CREATE TEMPORARY TABLE query_2_results (
    test_id INTEGER,
    user_id TEXT,
    forwarded_chat_popup_notifications BOOLEAN,
    forwarded_chat_sound_notifications BOOLEAN,
    forwarded_chat_email_notifications BOOLEAN,
    new_chat_popup_notifications BOOLEAN,
    new_chat_sound_notifications BOOLEAN,
    new_chat_email_notifications BOOLEAN,
    use_autocorrect BOOLEAN
);

-- Function to run the tests
DO $$
DECLARE
    test_rec RECORD;
    user_param TEXT;
BEGIN
    -- For each test case, run both queries and store results
    FOR test_rec IN SELECT * FROM test_cases LOOP
        user_param := test_rec.user_id;
        
        -- First query (original)
        INSERT INTO query_1_results (
            test_id,
            user_id,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        )
        SELECT 
            test_rec.test_id,
            user_id,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        FROM user_profile_settings
        WHERE user_id = user_param
        ORDER BY id DESC
        LIMIT 1;

        -- Second query (new denormalized version)
        INSERT INTO query_2_results (
            test_id,
            user_id,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        )
        SELECT
            test_rec.test_id,
            id_code AS user_id,
            forwarded_chat_popup_notifications,
            forwarded_chat_sound_notifications,
            forwarded_chat_email_notifications,
            new_chat_popup_notifications,
            new_chat_sound_notifications,
            new_chat_email_notifications,
            use_autocorrect
        FROM denorm_user_csa_authority_profile_settings
        WHERE id_code = user_param
        ORDER BY created DESC
        LIMIT 1;
    END LOOP;
END $$;

-- Create a combined results table for easier analysis, comparing all fields
CREATE TEMPORARY TABLE combined_results AS
SELECT
    tc.test_id,
    tc.user_id,
    q_1.forwarded_chat_popup_notifications AS q_1_forwarded_chat_popup,
    q_2.forwarded_chat_popup_notifications AS q_2_forwarded_chat_popup,
    q_1.forwarded_chat_sound_notifications AS q_1_forwarded_chat_sound,
    q_2.forwarded_chat_sound_notifications AS q_2_forwarded_chat_sound,
    q_1.forwarded_chat_email_notifications AS q_1_forwarded_chat_email,
    q_2.forwarded_chat_email_notifications AS q_2_forwarded_chat_email,
    q_1.new_chat_popup_notifications AS q_1_new_chat_popup,
    q_2.new_chat_popup_notifications AS q_2_new_chat_popup,
    q_1.new_chat_sound_notifications AS q_1_new_chat_sound,
    q_2.new_chat_sound_notifications AS q_2_new_chat_sound,
    q_1.new_chat_email_notifications AS q_1_new_chat_email,
    q_2.new_chat_email_notifications AS q_2_new_chat_email,
    q_1.use_autocorrect AS q_1_use_autocorrect,
    q_2.use_autocorrect AS q_2_use_autocorrect,
    -- Check if both results exist
    q_1.user_id IS NOT NULL AS in_query_1,
    q_2.user_id IS NOT NULL AS in_query_2,
    -- Check if all fields match
    (
        COALESCE(q_1.forwarded_chat_popup_notifications, FALSE)
        = COALESCE(q_2.forwarded_chat_popup_notifications, FALSE)
        AND COALESCE(q_1.forwarded_chat_sound_notifications, TRUE) = COALESCE(q_2.forwarded_chat_sound_notifications, TRUE)
        AND COALESCE(q_1.forwarded_chat_email_notifications, FALSE) = COALESCE(q_2.forwarded_chat_email_notifications, FALSE)
        AND COALESCE(q_1.new_chat_popup_notifications, FALSE) = COALESCE(q_2.new_chat_popup_notifications, FALSE)
        AND COALESCE(q_1.new_chat_sound_notifications, TRUE) = COALESCE(q_2.new_chat_sound_notifications, TRUE)
        AND COALESCE(q_1.new_chat_email_notifications, FALSE) = COALESCE(q_2.new_chat_email_notifications, FALSE)
        AND COALESCE(q_1.use_autocorrect, TRUE) = COALESCE(q_2.use_autocorrect, TRUE)
    ) OR (q_1.user_id IS NULL AND q_2.user_id IS NULL) AS fields_match,
    CASE
        WHEN q_1.user_id IS NULL AND q_2.user_id IS NULL THEN 'Both NULL'
        WHEN q_1.user_id IS NULL THEN 'Only in Query 2'
        WHEN q_2.user_id IS NULL THEN 'Only in Query 1'
        WHEN (
            COALESCE(q_1.forwarded_chat_popup_notifications, FALSE)
            = COALESCE(q_2.forwarded_chat_popup_notifications, FALSE)
            AND COALESCE(q_1.forwarded_chat_sound_notifications, TRUE) = COALESCE(q_2.forwarded_chat_sound_notifications, TRUE)
            AND COALESCE(q_1.forwarded_chat_email_notifications, FALSE) = COALESCE(q_2.forwarded_chat_email_notifications, FALSE)
            AND COALESCE(q_1.new_chat_popup_notifications, FALSE) = COALESCE(q_2.new_chat_popup_notifications, FALSE)
            AND COALESCE(q_1.new_chat_sound_notifications, TRUE) = COALESCE(q_2.new_chat_sound_notifications, TRUE)
            AND COALESCE(q_1.new_chat_email_notifications, FALSE) = COALESCE(q_2.new_chat_email_notifications, FALSE)
            AND COALESCE(q_1.use_autocorrect, TRUE) = COALESCE(q_2.use_autocorrect, TRUE)
        ) THEN 'Results Match'
        ELSE 'Field Mismatch'
    END AS result
FROM test_cases AS tc
    LEFT JOIN query_1_results AS q_1 ON tc.test_id = q_1.test_id
    LEFT JOIN query_2_results AS q_2 ON tc.test_id = q_2.test_id;

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
FROM query_2_results
UNION ALL
SELECT
    'Matching results' AS metric,
    COUNT(*) AS value
FROM combined_results
WHERE result = 'Results Match' OR result = 'Both NULL';

-- Find test cases where results differ
SELECT
    test_id,
    user_id,
    result,
    -- Show the mismatched fields for detailed debugging
    CASE
        WHEN
            q_1_forwarded_chat_popup != q_2_forwarded_chat_popup
            THEN 'forwarded_chat_popup_notifications'
    END AS mismatch_1,
    CASE
        WHEN
            q_1_forwarded_chat_sound != q_2_forwarded_chat_sound
            THEN 'forwarded_chat_sound_notifications'
    END AS mismatch_2,
    CASE
        WHEN
            q_1_forwarded_chat_email != q_2_forwarded_chat_email
            THEN 'forwarded_chat_email_notifications'
    END AS mismatch_3,
    CASE
        WHEN
            q_1_new_chat_popup != q_2_new_chat_popup
            THEN 'new_chat_popup_notifications'
    END AS mismatch_4,
    CASE
        WHEN
            q_1_new_chat_sound != q_2_new_chat_sound
            THEN 'new_chat_sound_notifications'
    END AS mismatch_5,
    CASE
        WHEN
            q_1_new_chat_email != q_2_new_chat_email
            THEN 'new_chat_email_notifications'
    END AS mismatch_6,
    CASE
        WHEN q_1_use_autocorrect != q_2_use_autocorrect THEN 'use_autocorrect'
    END AS mismatch_7
FROM combined_results
WHERE result NOT IN ('Results Match', 'Both NULL')
ORDER BY test_id;

-- Create test result table to determine if test passes or fails
CREATE TEMPORARY TABLE test_result AS
SELECT COUNT(*) = 0 AS queries_match
FROM combined_results
WHERE result NOT IN ('Results Match', 'Both NULL');

-- Output final test result (PASS/FAIL)
SELECT
    CASE
        WHEN queries_match
            THEN 'PASS: Queries return identical results for all test cases'
        ELSE 'FAIL: Queries return different results for some test cases'
    END AS test_result,
    (
        SELECT COUNT(*) FROM combined_results
        WHERE result NOT IN ('Results Match', 'Both NULL')
    ) AS different_results_count
FROM test_result;

-- Clean up
DROP TABLE IF EXISTS test_cases;
DROP TABLE IF EXISTS query_1_results;
DROP TABLE IF EXISTS query_2_results;
DROP TABLE IF EXISTS combined_results;
DROP TABLE IF EXISTS test_result;
