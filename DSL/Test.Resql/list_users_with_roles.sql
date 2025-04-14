-- Test script to compare results between original and denormalized queries
-- For PostgreSQL

-- Create temporary tables to store results from both queries
CREATE TEMPORARY TABLE query_1_results (
    row_id SERIAL PRIMARY KEY,
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
    row_id SERIAL PRIMARY KEY,
    login TEXT,
    first_name TEXT,
    last_name TEXT,
    id_code TEXT,
    display_name TEXT,
    csa_title TEXT,
    csa_email TEXT,
    authorities TEXT []
);

-- Execute the original query and store results
INSERT INTO query_1_results (
    login, first_name, last_name, id_code,
    display_name, csa_title, csa_email, authorities
)
SELECT
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
    status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND id IN (
        SELECT MAX(id) FROM "user"
        GROUP BY id_code
    );

-- Execute the denormalized query and store results
INSERT INTO query_2_results (
    login, first_name, last_name, id_code,
    display_name, csa_title, csa_email, authorities
)
SELECT
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
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND id IN (
        SELECT MAX(id) FROM denorm_user_csa_authority_profile_settings
        GROUP BY id_code
    );

-- Basic count comparison
SELECT
    'Original query results' AS source,
    COUNT(*) AS row_count
FROM query_1_results
UNION ALL
SELECT
    'Denormalized query results' AS source,
    COUNT(*) AS row_count
FROM query_2_results;

-- Create a hashed value for each result row to facilitate comparison
CREATE TEMPORARY TABLE hash_comparison AS
SELECT
    'Original' AS query_source,
    id_code,
    MD5(
        COALESCE(login, '') || '|'
        || COALESCE(first_name, '') || '|'
        || COALESCE(last_name, '') || '|'
        || COALESCE(id_code, '') || '|'
        || COALESCE(display_name, '') || '|'
        || COALESCE(csa_title, '') || '|'
        || COALESCE(csa_email, '') || '|'
        || COALESCE(authorities::TEXT, '')
    ) AS row_hash
FROM query_1_results
UNION ALL
SELECT
    'Denormalized' AS query_source,
    id_code,
    MD5(
        COALESCE(login, '') || '|'
        || COALESCE(first_name, '') || '|'
        || COALESCE(last_name, '') || '|'
        || COALESCE(id_code, '') || '|'
        || COALESCE(display_name, '') || '|'
        || COALESCE(csa_title, '') || '|'
        || COALESCE(csa_email, '') || '|'
        || COALESCE(authorities::TEXT, '')
    ) AS row_hash
FROM query_2_results;

-- Find unique id_codes that exist in either query
CREATE TEMPORARY TABLE all_id_codes AS
SELECT DISTINCT id_code FROM hash_comparison;

-- Pivot the data to compare hashes side by side
CREATE TEMPORARY TABLE comparison_result AS
SELECT
    aic.id_code,
    MAX(
        CASE WHEN hc.query_source = 'Original' THEN hc.row_hash END
    ) AS original_hash,
    MAX(
        CASE WHEN hc.query_source = 'Denormalized' THEN hc.row_hash END
    ) AS denormalized_hash
FROM all_id_codes AS aic
    LEFT JOIN hash_comparison AS hc ON aic.id_code = hc.id_code
GROUP BY aic.id_code;

-- Identify discrepancies
CREATE TEMPORARY TABLE discrepancies AS
SELECT
    id_code,
    CASE
        WHEN original_hash IS NULL THEN 'Only in Denormalized Query'
        WHEN denormalized_hash IS NULL THEN 'Only in Original Query'
        WHEN original_hash <> denormalized_hash THEN 'Values Differ'
        ELSE 'Identical'
    END AS result
FROM comparison_result
WHERE
    original_hash IS NULL
    OR denormalized_hash IS NULL
    OR original_hash <> denormalized_hash;

-- Detailed comparison for rows with different values
CREATE TEMPORARY TABLE detailed_diff AS
SELECT
    cr.id_code,
    'login' AS field,
    q_1.login AS original_value,
    q_2.login AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.login <> q_2.login
UNION ALL
SELECT
    cr.id_code,
    'first_name' AS field,
    q_1.first_name AS original_value,
    q_2.first_name AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.first_name <> q_2.first_name
UNION ALL
SELECT
    cr.id_code,
    'last_name' AS field,
    q_1.last_name AS original_value,
    q_2.last_name AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.last_name <> q_2.last_name
UNION ALL
SELECT
    cr.id_code,
    'display_name' AS field,
    q_1.display_name AS original_value,
    q_2.display_name AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.display_name <> q_2.display_name
UNION ALL
SELECT
    cr.id_code,
    'csa_title' AS field,
    q_1.csa_title AS original_value,
    q_2.csa_title AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.csa_title <> q_2.csa_title
UNION ALL
SELECT
    cr.id_code,
    'csa_email' AS field,
    q_1.csa_email AS original_value,
    q_2.csa_email AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.csa_email <> q_2.csa_email
UNION ALL
SELECT
    cr.id_code,
    'authorities' AS field,
    q_1.authorities::TEXT AS original_value,
    q_2.authorities::TEXT AS denormalized_value
FROM comparison_result AS cr
    INNER JOIN query_1_results AS q_1 ON cr.id_code = q_1.id_code
    INNER JOIN query_2_results AS q_2 ON cr.id_code = q_2.id_code
WHERE
    cr.original_hash <> cr.denormalized_hash
    AND q_1.authorities <> q_2.authorities;

-- Count of rows by match status
SELECT
    COALESCE(result, 'Identical') AS result_type,
    COUNT(*) AS count
FROM (
    SELECT
        id_code,
        result
    FROM discrepancies
    UNION ALL
    SELECT
        id_code,
        NULL AS result
    FROM comparison_result
    WHERE id_code NOT IN (SELECT id_code FROM discrepancies)
) AS all_results
GROUP BY result
ORDER BY
    CASE
        WHEN result IS NULL THEN 1
        ELSE 2
    END,
    count DESC;

-- Detailed differences for investigation
SELECT * FROM detailed_diff
ORDER BY id_code, field;

-- List id_codes found only in one query
SELECT
    id_code,
    result
FROM discrepancies
WHERE
    result IN ('Only in Original Query', 'Only in Denormalized Query')
ORDER BY result, id_code;

-- Final test result
SELECT
    CASE
        WHEN
            (SELECT COUNT(*) FROM discrepancies) = 0
            THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results'
    END AS test_result;

-- Clean up
DROP TABLE query_1_results;
DROP TABLE query_2_results;
DROP TABLE hash_comparison;
DROP TABLE all_id_codes;
DROP TABLE comparison_result;
DROP TABLE discrepancies;
DROP TABLE detailed_diff;
