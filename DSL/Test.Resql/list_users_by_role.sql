-- Test script to compare two queries for equivalent results
-- Designed for PostgreSQL

-- First, create tables for test cases and results
DROP TABLE IF EXISTS test_cases; 
DROP TABLE IF EXISTS query_1_results;
DROP TABLE IF EXISTS query_2_results;
DROP TABLE IF EXISTS comparison_results;

CREATE TEMPORARY TABLE test_cases (
    test_id SERIAL PRIMARY KEY,
    page INTEGER,
    page_size INTEGER,
    roles TEXT[],
    search_display_name_and_csa_title TEXT,
    search_full_name_and_csa_title TEXT,
    show_active_only BOOLEAN,
    search_full_name TEXT,
    search_id_code TEXT,
    search_display_name TEXT,
    search_csa_title TEXT,
    search_csa_email TEXT,
    search_authority TEXT,
    search_department TEXT,
    excluded_users TEXT[],
    sorting TEXT
);

-- Create tables for results
CREATE TEMPORARY TABLE query_1_results (
    test_id INTEGER,
    id_code TEXT,
    result_json JSONB
);

CREATE TEMPORARY TABLE query_2_results (
    test_id INTEGER,
    id_code TEXT,
    result_json JSONB
);

-- Generate test cases (smaller number for easier testing)
INSERT INTO test_cases (
    page, 
    page_size, 
    roles, 
    search_display_name_and_csa_title,
    search_full_name_and_csa_title,
    show_active_only,
    search_full_name,
    search_id_code,
    search_display_name,
    search_csa_title,
    search_csa_email,
    search_authority,
    search_department,
    excluded_users,
    sorting
)
VALUES
(1, 10, ARRAY['ROLE_ADMINISTRATOR','ROLE_CUSTOMER_SUPPORT_AGENT','ROLE_SERVICE_MANAGER','ROLE_CHATBOT_TRAINER','ROLE_ANALYST'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::TEXT[], 'name asc'),
(1, 10, ARRAY['ROLE_ADMINISTRATOR','ROLE_CUSTOMER_SUPPORT_AGENT','ROLE_SERVICE_MANAGER','ROLE_CHATBOT_TRAINER','ROLE_ANALYST'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::TEXT[], 'idCode asc'),
(1, 10, ARRAY['ROLE_ADMINISTRATOR','ROLE_CUSTOMER_SUPPORT_AGENT','ROLE_SERVICE_MANAGER','ROLE_CHATBOT_TRAINER','ROLE_ANALYST'], NULL, NULL, NULL, 'Mill', NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::TEXT[], 'name asc');
(1, 10, ARRAY['ROLE_ADMINISTRATOR','ROLE_CUSTOMER_SUPPORT_AGENT','ROLE_SERVICE_MANAGER','ROLE_CHATBOT_TRAINER','ROLE_ANALYST'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::TEXT[], 'name desc'),
(2, 10, ARRAY['ROLE_ADMINISTRATOR','ROLE_CUSTOMER_SUPPORT_AGENT','ROLE_SERVICE_MANAGER','ROLE_CHATBOT_TRAINER','ROLE_ANALYST'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::TEXT[], 'name asc'),
(3, 10, ARRAY['ROLE_ADMINISTRATOR','ROLE_CUSTOMER_SUPPORT_AGENT','ROLE_SERVICE_MANAGER','ROLE_CHATBOT_TRAINER','ROLE_ANALYST'], NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::TEXT[], 'name asc');

-- Create function to run the tests in a loop
CREATE OR REPLACE FUNCTION run_test_cases() RETURNS VOID AS $$
DECLARE
    test_rec RECORD;
    page INT;
    page_size INT;
    roles TEXT[];
    search_display_name_and_csa_title TEXT;
    search_full_name_and_csa_title TEXT;
    show_active_only BOOLEAN;
    search_full_name TEXT;
    search_id_code TEXT;
    search_display_name TEXT;
    search_csa_title TEXT;
    search_csa_email TEXT;
    search_authority TEXT;
    search_department TEXT;
    excluded_users TEXT[];
    sorting TEXT;
BEGIN
    -- Iterate through each test case
    FOR test_rec IN SELECT * FROM test_cases ORDER BY test_id
    LOOP
        -- Assign values for current test case
        page := test_rec.page;
        page_size := test_rec.page_size;
        roles := test_rec.roles;
        search_display_name_and_csa_title := test_rec.search_display_name_and_csa_title;
        search_full_name_and_csa_title := test_rec.search_full_name_and_csa_title;
        show_active_only := test_rec.show_active_only;
        search_full_name := test_rec.search_full_name;
        search_id_code := test_rec.search_id_code;
        search_display_name := test_rec.search_display_name;
        search_csa_title := test_rec.search_csa_title;
        search_csa_email := test_rec.search_csa_email;
        search_authority := test_rec.search_authority;
        search_department := test_rec.search_department;
        excluded_users := test_rec.excluded_users;
        sorting := test_rec.sorting;
        
        -- Run Query 1 for current test case
        EXECUTE format('
            INSERT INTO query_1_results (test_id, id_code, result_json)
            SELECT
                %s AS test_id,
                u.id_code,
                jsonb_build_object(
                    ''login'', u.login,
                    ''first_name'', u.first_name,
                    ''last_name'', u.last_name,
                    ''id_code'', u.id_code,
                    ''display_name'', u.display_name,
                    ''csa_title'', u.csa_title,
                    ''csa_email'', u.csa_email,
                    ''department'', u.department,
                    ''authorities'', ua.authority_name,
                    ''customer_support_status'', csa.status,
                    ''total_pages'', CEIL(COUNT(*) OVER () / %s::DECIMAL)
                ) AS result_json
            FROM "user" AS u
                LEFT JOIN (
                    SELECT
                        ua.authority_name,
                        ua.user_id,
                        ROW_NUMBER() OVER (
                            PARTITION BY ua.user_id
                            ORDER BY ua.id DESC
                        ) AS rn
                    FROM user_authority AS ua
                    WHERE
                        ua.authority_name && $1::CHARACTER VARYING ARRAY
                        AND ua.id IN (
                            SELECT MAX(id)
                            FROM user_authority
                            GROUP BY user_id
                        )
                ) AS ua ON u.id_code = ua.user_id
                INNER JOIN (
                    SELECT
                        id_code,
                        status,
                        ROW_NUMBER() OVER (
                            PARTITION BY id_code
                            ORDER BY id DESC
                        ) AS rn
                    FROM customer_support_agent_activity
                ) AS csa ON u.id_code = csa.id_code AND csa.rn = 1
            WHERE
                u.status <> ''deleted''
                AND ARRAY_LENGTH(authority_name, 1) > 0
                AND u.id IN (
                    SELECT MAX(id)
                    FROM "user"
                    GROUP BY id_code
                )
                AND (
                    $2 IS NULL
                    OR LOWER(u.display_name) LIKE LOWER(
                        ''%%'' || $2 || ''%%''
                    )
                    OR LOWER(u.csa_title) LIKE LOWER(
                        ''%%'' || $2 || ''%%''
                    )
                )
                AND (
                    $3 IS NULL
                    OR LOWER(u.first_name || '' '' || u.last_name) LIKE LOWER(
                        ''%%'' || $3 || ''%%''
                    )
                    OR LOWER(u.csa_title) LIKE LOWER(''%%'' || $3 || ''%%'')
                )
                -- AND ($4 <> TRUE OR csa.status <> ''offline'')
                AND ($5 IS NULL OR (
                    (u.first_name || '' '' || u.last_name) ILIKE ''%%'' || $5 || ''%%''
                ))
                AND ($6 IS NULL OR u.id_code ILIKE ''%%'' || $6 || ''%%'')
                AND (
                    $7 IS NULL
                    OR u.display_name ILIKE ''%%'' || $7 || ''%%''
                )
                AND ($8 IS NULL OR u.csa_title ILIKE ''%%'' || $8 || ''%%'')
                AND ($9 IS NULL OR u.csa_email ILIKE ''%%'' || $9 || ''%%'')
                AND ($10 IS NULL OR EXISTS (
                    SELECT 1
                    FROM UNNEST(ua.authority_name) AS authority
                    WHERE authority ILIKE ''%%'' || $10 || ''%%''
                ))
                AND (
                    $11 IS NULL
                    OR u.department ILIKE ''%%'' || $11 || ''%%''
                )
                AND u.id_code NOT IN (SELECT unnest($12::TEXT[]))
            ORDER BY
                CASE WHEN $13 = ''name asc'' THEN u.first_name END ASC,
                CASE WHEN $13 = ''name desc'' THEN u.first_name END DESC,
                CASE WHEN $13 = ''idCode asc'' THEN u.id_code END ASC,
                CASE WHEN $13 = ''idCode desc'' THEN u.id_code END DESC,
                CASE WHEN $13 = ''Role asc'' THEN ua.authority_name END ASC,
                CASE WHEN $13 = ''Role desc'' THEN ua.authority_name END DESC,
                CASE WHEN $13 = ''displayName asc'' THEN u.display_name END ASC,
                CASE WHEN $13 = ''displayName desc'' THEN u.display_name END DESC,
                CASE WHEN $13 = ''csaTitle asc'' THEN u.csa_title END ASC,
                CASE WHEN $13 = ''csaTitle desc'' THEN u.csa_title END DESC,
                CASE WHEN $13 = ''csaEmail asc'' THEN u.csa_email END ASC,
                CASE WHEN $13 = ''csaEmail desc'' THEN u.csa_email END DESC,
                CASE WHEN $13 = ''department asc'' THEN u.department END ASC,
                CASE WHEN $13 = ''department desc'' THEN u.department END DESC,
                CASE WHEN $13 = ''customerSupportStatus asc'' THEN csa.status END ASC,
                CASE WHEN $13 = ''customerSupportStatus desc'' THEN csa.status END DESC
            OFFSET ((GREATEST(%s, 1) - 1) * %s) LIMIT %s', 
            test_rec.test_id, 
            test_rec.page_size,
            test_rec.page,
            test_rec.page_size,
            test_rec.page_size)
        USING 
            roles,
            search_display_name_and_csa_title,
            search_full_name_and_csa_title,
            show_active_only,
            search_full_name,
            search_id_code,
            search_display_name,
            search_csa_title,
            search_csa_email,
            search_authority,
            search_department,
            excluded_users,
            sorting;
            
        -- Run Query 2 for current test case
        EXECUTE format('
            INSERT INTO query_2_results (test_id, id_code, result_json)
            SELECT
                %s AS test_id,
                id_code,
                jsonb_build_object(
                    ''login'', login,
                    ''first_name'', first_name,
                    ''last_name'', last_name,
                    ''id_code'', id_code,
                    ''display_name'', display_name,
                    ''csa_title'', csa_title,
                    ''csa_email'', csa_email,
                    ''department'', department,
                    ''authorities'', authority_name,
                    ''customer_support_status'', status,
                    ''total_pages'', CEIL(COUNT(*) OVER () / %s::DECIMAL)
                ) AS result_json
            FROM denorm_user_csa_authority_profile_settings
            WHERE
                user_status <> ''deleted''
                AND ARRAY_LENGTH(authority_name, 1) > 0
                AND id IN (
                    SELECT MAX(id)
                    FROM denorm_user_csa_authority_profile_settings
                    GROUP BY id_code
                )
                AND authority_name && $1::CHARACTER VARYING ARRAY
                AND (
                    $2 IS NULL
                    OR LOWER(display_name) LIKE LOWER(
                        ''%%'' || $2 || ''%%''
                    )
                    OR LOWER(csa_title) LIKE LOWER(
                        ''%%'' || $2 || ''%%''
                    )
                )
                AND (
                    $3 IS NULL
                    OR LOWER(first_name || '' '' || last_name) LIKE LOWER(
                        ''%%'' || $3 || ''%%''
                    )
                    OR LOWER(csa_title) LIKE LOWER(''%%'' || $3 || ''%%'')
                )
                -- AND ($4 <> TRUE OR status <> ''offline'')
                AND ($5 IS NULL OR (
                    (first_name || '' '' || last_name) ILIKE ''%%'' || $5 || ''%%''
                ))
                AND ($6 IS NULL OR id_code ILIKE ''%%'' || $6 || ''%%'')
                AND (
                    $7 IS NULL
                    OR display_name ILIKE ''%%'' || $7 || ''%%''
                )
                AND ($8 IS NULL OR csa_title ILIKE ''%%'' || $8 || ''%%'')
                AND ($9 IS NULL OR csa_email ILIKE ''%%'' || $9 || ''%%'')
                AND ($10 IS NULL OR EXISTS (
                    SELECT 1
                    FROM UNNEST(authority_name) AS authority
                    WHERE authority ILIKE ''%%'' || $10 || ''%%''
                ))
                AND (
                    $11 IS NULL
                    OR department ILIKE ''%%'' || $11 || ''%%''
                )
                AND id_code NOT IN (SELECT unnest($12::TEXT[]))
            ORDER BY
                CASE WHEN $13 = ''name asc'' THEN first_name END ASC,
                CASE WHEN $13 = ''name desc'' THEN first_name END DESC,
                CASE WHEN $13 = ''idCode asc'' THEN id_code END ASC,
                CASE WHEN $13 = ''idCode desc'' THEN id_code END DESC,
                CASE WHEN $13 = ''Role asc'' THEN authority_name END ASC,
                CASE WHEN $13 = ''Role desc'' THEN authority_name END DESC,
                CASE WHEN $13 = ''displayName asc'' THEN display_name END ASC,
                CASE WHEN $13 = ''displayName desc'' THEN display_name END DESC,
                CASE WHEN $13 = ''csaTitle asc'' THEN csa_title END ASC,
                CASE WHEN $13 = ''csaTitle desc'' THEN csa_title END DESC,
                CASE WHEN $13 = ''csaEmail asc'' THEN csa_email END ASC,
                CASE WHEN $13 = ''csaEmail desc'' THEN csa_email END DESC,
                CASE WHEN $13 = ''department asc'' THEN department END ASC,
                CASE WHEN $13 = ''department desc'' THEN department END DESC,
                CASE WHEN $13 = ''customerSupportStatus asc'' THEN status END ASC,
                CASE WHEN $13 = ''customerSupportStatus desc'' THEN status END DESC
            OFFSET ((GREATEST(%s, 1) - 1) * %s) LIMIT %s', 
            test_rec.test_id, 
            test_rec.page_size,
            test_rec.page,
            test_rec.page_size,
            test_rec.page_size)
        USING 
            roles,
            search_display_name_and_csa_title,
            search_full_name_and_csa_title,
            show_active_only,
            search_full_name,
            search_id_code,
            search_display_name,
            search_csa_title,
            search_csa_email,
            search_authority,
            search_department,
            excluded_users,
            sorting;
            
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the procedure
SELECT run_test_cases();

-- Create a simple comparison table to analyze differences
CREATE TEMPORARY TABLE comparison_results AS
SELECT
    tc.test_id,
    tc.page,
    tc.page_size,
    tc.roles,
    tc.sorting,
    (SELECT COUNT(*) FROM query_1_results WHERE test_id = tc.test_id) AS q1_result_count,
    (SELECT COUNT(*) FROM query_2_results WHERE test_id = tc.test_id) AS q2_result_count,
    (SELECT COUNT(*) FROM (
        SELECT id_code FROM query_1_results WHERE test_id = tc.test_id
        EXCEPT
        SELECT id_code FROM query_2_results WHERE test_id = tc.test_id
    ) AS q1_only) AS only_in_q1,
    (SELECT COUNT(*) FROM (
        SELECT id_code FROM query_2_results WHERE test_id = tc.test_id
        EXCEPT
        SELECT id_code FROM query_1_results WHERE test_id = tc.test_id
    ) AS q2_only) AS only_in_q2,
    (
        (SELECT COUNT(*) FROM (
            SELECT test_id, id_code FROM query_1_results WHERE test_id = tc.test_id
            EXCEPT 
            SELECT test_id, id_code FROM query_2_results WHERE test_id = tc.test_id
        ) AS diff1) = 0
        AND
        (SELECT COUNT(*) FROM (
            SELECT test_id, id_code FROM query_2_results WHERE test_id = tc.test_id
            EXCEPT 
            SELECT test_id, id_code FROM query_1_results WHERE test_id = tc.test_id
        ) AS diff2) = 0
    ) AS id_sets_match,
    (
        SELECT jsonb_agg(q1.id_code)
        FROM (
            SELECT id_code FROM query_1_results WHERE test_id = tc.test_id
            EXCEPT
            SELECT id_code FROM query_2_results WHERE test_id = tc.test_id
        ) AS q1
    ) AS ids_only_in_q1,
    (
        SELECT jsonb_agg(q2.id_code)
        FROM (
            SELECT id_code FROM query_2_results WHERE test_id = tc.test_id
            EXCEPT
            SELECT id_code FROM query_1_results WHERE test_id = tc.test_id
        ) AS q2
    ) AS ids_only_in_q2
FROM test_cases tc;

-- View test results summary
SELECT
    COUNT(*) AS total_test_cases,
    SUM(CASE WHEN id_sets_match THEN 1 ELSE 0 END) AS matching_id_sets,
    SUM(CASE WHEN NOT id_sets_match THEN 1 ELSE 0 END) AS non_matching_id_sets,
    ROUND(100.0 * SUM(CASE WHEN id_sets_match THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 2) AS match_percentage
FROM comparison_results;

-- View details of mismatched cases
SELECT
    test_id,
    page,
    page_size,
    roles,
    sorting,
    q1_result_count,
    q2_result_count,
    only_in_q1,
    only_in_q2,
    ids_only_in_q1,
    ids_only_in_q2
FROM comparison_results
WHERE NOT id_sets_match
ORDER BY test_id;

-- For a deeper analysis of differences in individual fields for matching IDs
SELECT 
    q1.test_id,
    q1.id_code,
    q1.result_json AS q1_data,
    q2.result_json AS q2_data
FROM query_1_results q1
JOIN query_2_results q2 ON q1.test_id = q2.test_id AND q1.id_code = q2.id_code
WHERE q1.result_json <> q2.result_json
LIMIT 10;

-- Check if there are any differences in field values for the same user
CREATE OR REPLACE FUNCTION check_field_value_differences() RETURNS TABLE (
    test_id INTEGER,
    id_code TEXT,
    field_name TEXT,
    q1_value TEXT,
    q2_value TEXT
) AS $$
DECLARE
    fields TEXT[] := ARRAY['login', 'first_name', 'last_name', 'id_code', 'display_name', 
                           'csa_title', 'csa_email', 'department', 'authorities', 
                           'customer_support_status', 'total_pages'];
    field TEXT;
    result_record RECORD;
BEGIN
    FOR result_record IN
        SELECT 
            q1.test_id,
            q1.id_code,
            q1.result_json AS q1_data,
            q2.result_json AS q2_data
        FROM query_1_results q1
        JOIN query_2_results q2 
            ON q1.test_id = q2.test_id 
            AND q1.id_code = q2.id_code
        WHERE q1.result_json <> q2.result_json
    LOOP
        -- Check each field for differences
        FOREACH field IN ARRAY fields
        LOOP
            -- Skip if the field doesn't exist in either JSON
            IF NOT (result_record.q1_data ? field) OR NOT (result_record.q2_data ? field) THEN
                CONTINUE;
            END IF;
            
            -- If values don't match, output the difference
            IF result_record.q1_data->>field IS DISTINCT FROM result_record.q2_data->>field THEN
                test_id := result_record.test_id;
                id_code := result_record.id_code;
                field_name := field;
                q1_value := result_record.q1_data->>field;
                q2_value := result_record.q2_data->>field;
                RETURN NEXT;
            END IF;
        END LOOP;
    END LOOP;
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- Check for specific field differences
SELECT * FROM check_field_value_differences();

-- Final PASS/FAIL determination
SELECT
    CASE
        WHEN 
            (SELECT COUNT(*) = 0 FROM (
                -- Check that record sets match
                SELECT 1 FROM comparison_results WHERE NOT id_sets_match
                UNION ALL
                -- Check that there are no field value differences
                SELECT 1 FROM check_field_value_differences()
            ) AS differences)
        THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result;

select count(*) from query_1_results;
select count(*) from query_2_results;

DROP FUNCTION IF EXISTS run_test_cases();
DROP FUNCTION IF EXISTS check_field_value_differences();
DROP TABLE IF EXISTS test_cases; 
DROP TABLE IF EXISTS query_1_results;
DROP TABLE IF EXISTS query_2_results;
DROP TABLE IF EXISTS comparison_results;