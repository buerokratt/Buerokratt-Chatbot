-- Create a temporary table for test IDs
CREATE TEMPORARY TABLE test_ids (
    test_id SERIAL PRIMARY KEY,
    chat_id TEXT
);

-- Insert test cases - select a variety of real chat IDs from the database
INSERT INTO test_ids (chat_id)
SELECT DISTINCT base_id AS chat_id
FROM chat
WHERE 
    base_id IS NOT NULL 
    AND ended IS NOT NULL
ORDER BY RANDOM()
LIMIT 20;

-- Add some edge cases if they exist
INSERT INTO test_ids (chat_id)
SELECT base_id FROM chat 
WHERE feedback_rating IS NOT NULL 
ORDER BY feedback_rating DESC LIMIT 2
ON CONFLICT (test_id) DO NOTHING;

INSERT INTO test_ids (chat_id)
SELECT base_id FROM chat 
WHERE csa_title IS NOT NULL AND csa_title <> '' 
ORDER BY RANDOM() LIMIT 2
ON CONFLICT (test_id) DO NOTHING;

INSERT INTO test_ids (chat_id)
SELECT base_id FROM chat 
WHERE forwarded_to_name IS NOT NULL 
ORDER BY RANDOM() LIMIT 2
ON CONFLICT (test_id) DO NOTHING;

-- Create result tables for each query
CREATE TEMPORARY TABLE original_query_results (
    test_id INTEGER,
    id TEXT,
    customer_support_id TEXT,
    customer_support_display_name TEXT,
    end_user_id TEXT,
    end_user_first_name TEXT,
    end_user_last_name TEXT,
    status TEXT,
    feedback_text TEXT,
    feedback_rating INTEGER,
    end_user_email TEXT,
    end_user_phone TEXT,
    end_user_os TEXT,
    end_user_url TEXT,
    created TIMESTAMP,
    updated TIMESTAMP,
    ended TIMESTAMP,
    external_id TEXT,
    received_from TEXT,
    received_from_name TEXT,
    forwarded_to_name TEXT,
    forwarded_to TEXT,
    last_message TEXT,
    last_message_timestamp TIMESTAMP,
    csa_title TEXT,
    PRIMARY KEY (test_id, id)
);

CREATE TEMPORARY TABLE denormalized_query_results (
    test_id INTEGER,
    id TEXT,
    customer_support_id TEXT,
    customer_support_display_name TEXT,
    end_user_id TEXT,
    end_user_first_name TEXT,
    end_user_last_name TEXT,
    status TEXT,
    feedback_text TEXT,
    feedback_rating INTEGER,
    end_user_email TEXT,
    end_user_phone TEXT,
    end_user_os TEXT,
    end_user_url TEXT,
    created TIMESTAMP,
    updated TIMESTAMP,
    ended TIMESTAMP,
    external_id TEXT,
    received_from TEXT,
    received_from_name TEXT,
    forwarded_to TEXT,
    forwarded_to_name TEXT,
    last_message TEXT,
    last_message_timestamp TIMESTAMP,
    csa_title TEXT,
    PRIMARY KEY (test_id, id)
);

-- Run each test case individually in a loop
DO $$
DECLARE
    param_record RECORD;
BEGIN
    FOR param_record IN SELECT * FROM test_ids
    LOOP
        -- Run original query for this test case
        EXECUTE 'INSERT INTO original_query_results (
            test_id, id, customer_support_id, customer_support_display_name,
            end_user_id, end_user_first_name, end_user_last_name, status,
            feedback_text, feedback_rating, end_user_email, end_user_phone,
            end_user_os, end_user_url, created, updated, ended, external_id,
            received_from, received_from_name, forwarded_to_name, forwarded_to,
            last_message, last_message_timestamp, csa_title
        )
        SELECT
            ' || param_record.test_id || ',
            c.base_id AS id,
            c.customer_support_id,
            c.customer_support_display_name,
            c.end_user_id,
            c.end_user_first_name,
            c.end_user_last_name,
            c.status,
            c.feedback_text,
            c.feedback_rating,
            c.end_user_email,
            c.end_user_phone,
            c.end_user_os,
            c.end_user_url,
            c.created,
            c.updated,
            c.ended,
            c.external_id,
            c.received_from,
            c.received_from_name,
            c.forwarded_to_name,
            c.forwarded_to,
            m.content AS last_message,
            m.updated AS last_message_timestamp,
            (CASE
                WHEN
                    (
                        SELECT value FROM configuration
                        WHERE key = ''is_csa_title_visible'' AND configuration.id IN (
                            SELECT MAX(id) FROM configuration
                            GROUP BY key
                        ) AND deleted = false
                    ) = ''true''
                    THEN c.csa_title
                ELSE ''''
            END) AS csa_title
        FROM (
            SELECT
                base_id,
                customer_support_id,
                customer_support_display_name,
                end_user_id,
                end_user_first_name,
                end_user_last_name,
                status,
                feedback_text,
                feedback_rating,
                end_user_email,
                end_user_phone,
                end_user_os,
                end_user_url,
                created,
                updated,
                ended,
                external_id,
                received_from,
                received_from_name,
                forwarded_to_name,
                forwarded_to,
                csa_title
            FROM chat
            WHERE base_id = ''' || param_record.chat_id || '''
            ORDER BY updated DESC
            LIMIT 1
        ) AS c
            INNER JOIN message AS m ON c.base_id = m.chat_base_id
        ORDER BY m.updated DESC
        LIMIT 1';
        
        -- Run denormalized query for this test case
        EXECUTE 'INSERT INTO denormalized_query_results (
            test_id, id, customer_support_id, customer_support_display_name,
            end_user_id, end_user_first_name, end_user_last_name, status,
            feedback_text, feedback_rating, end_user_email, end_user_phone,
            end_user_os, end_user_url, created, updated, ended, external_id,
            received_from, received_from_name, forwarded_to, forwarded_to_name,
            last_message, last_message_timestamp, csa_title
        )
        SELECT
            ' || param_record.test_id || ',
            c.chat_id AS id,
            c.customer_support_id,
            c.customer_support_display_name,
            c.end_user_id,
            c.end_user_first_name,
            c.end_user_last_name,
            c.status,
            c.feedback_text,
            c.feedback_rating,
            c.end_user_email,
            c.end_user_phone,
            c.end_user_os,
            c.end_user_url,
            c.created,
            c.updated,
            c.ended,
            c.external_id,
            c.received_from,
            c.received_from_name,
            c.forwarded_to_name,
            c.forwarded_to,
            c.last_message_including_empty_content,
            c.last_message_timestamp,
            c.csa_title
        FROM denormalized_chat c
        WHERE chat_id = ''' || param_record.chat_id || '''
        ORDER BY denormalized_record_created DESC
        LIMIT 1';
    END LOOP;
END $$;

-- Create comparison table to track differences
CREATE TEMPORARY TABLE comparison AS
WITH row_comparison AS (
    SELECT
        COALESCE(o.test_id, d.test_id) AS test_id,
        COALESCE(o.id, d.id) AS id,
        o.id IS NOT NULL AS in_original,
        d.id IS NOT NULL AS in_denormalized,
        -- Compare each column individually
        (o.customer_support_id IS NOT DISTINCT FROM d.customer_support_id) AS customer_support_id_match,
        (o.customer_support_display_name IS NOT DISTINCT FROM d.customer_support_display_name) AS customer_support_display_name_match,
        (o.end_user_id IS NOT DISTINCT FROM d.end_user_id) AS end_user_id_match,
        (o.end_user_first_name IS NOT DISTINCT FROM d.end_user_first_name) AS end_user_first_name_match,
        (o.end_user_last_name IS NOT DISTINCT FROM d.end_user_last_name) AS end_user_last_name_match,
        (o.status IS NOT DISTINCT FROM d.status) AS status_match,
        (o.feedback_text IS NOT DISTINCT FROM d.feedback_text) AS feedback_text_match,
        (o.feedback_rating IS NOT DISTINCT FROM d.feedback_rating) AS feedback_rating_match,
        (o.end_user_email IS NOT DISTINCT FROM d.end_user_email) AS end_user_email_match,
        (o.end_user_phone IS NOT DISTINCT FROM d.end_user_phone) AS end_user_phone_match,
        (o.end_user_os IS NOT DISTINCT FROM d.end_user_os) AS end_user_os_match,
        (o.end_user_url IS NOT DISTINCT FROM d.end_user_url) AS end_user_url_match,
        (o.created IS NOT DISTINCT FROM d.created) AS created_match,
        (o.updated IS NOT DISTINCT FROM d.updated) AS updated_match,
        (o.ended IS NOT DISTINCT FROM d.ended) AS ended_match,
        (o.external_id IS NOT DISTINCT FROM d.external_id) AS external_id_match,
        (o.received_from IS NOT DISTINCT FROM d.received_from) AS received_from_match,
        (o.received_from_name IS NOT DISTINCT FROM d.received_from_name) AS received_from_name_match,
        (o.forwarded_to_name IS NOT DISTINCT FROM d.forwarded_to_name) AS forwarded_to_name_match,
        (o.forwarded_to IS NOT DISTINCT FROM d.forwarded_to) AS forwarded_to_match,
        (o.last_message IS NOT DISTINCT FROM d.last_message) AS last_message_match,
        (o.last_message_timestamp IS NOT DISTINCT FROM d.last_message_timestamp) AS last_message_timestamp_match,
        (o.csa_title IS NOT DISTINCT FROM d.csa_title) AS csa_title_match
    FROM original_query_results o
    FULL OUTER JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id
)
SELECT
    test_id,
    id,
    in_original,
    in_denormalized,
    customer_support_id_match,
    customer_support_display_name_match,
    end_user_id_match,
    end_user_first_name_match,
    end_user_last_name_match,
    status_match,
    feedback_text_match,
    feedback_rating_match,
    end_user_email_match,
    end_user_phone_match,
    end_user_os_match,
    end_user_url_match,
    created_match,
    updated_match,
    ended_match,
    external_id_match,
    received_from_match,
    received_from_name_match,
    forwarded_to_name_match,
    forwarded_to_match,
    last_message_match,
    last_message_timestamp_match,
    csa_title_match,
    -- Calculate if all fields match
    (
        customer_support_id_match AND
        customer_support_display_name_match AND
        end_user_id_match AND
        end_user_first_name_match AND
        end_user_last_name_match AND
        status_match AND
        feedback_text_match AND
        feedback_rating_match AND
        end_user_email_match AND
        end_user_phone_match AND
        end_user_os_match AND
        end_user_url_match AND
        created_match AND
        updated_match AND
        ended_match AND
        external_id_match AND
        received_from_match AND
        received_from_name_match AND
        forwarded_to_name_match AND
        forwarded_to_match AND
        last_message_match AND
        last_message_timestamp_match AND
        csa_title_match
    ) AS all_match
FROM row_comparison;

-- Show test chat IDs
SELECT test_id, chat_id FROM test_ids ORDER BY test_id;

-- Show summary statistics per test case
SELECT
    t.test_id,
    t.chat_id,
    CASE WHEN EXISTS (
        SELECT 1 FROM comparison c 
        WHERE c.test_id = t.test_id AND (NOT c.in_original OR NOT c.in_denormalized OR NOT c.all_match)
    )
    THEN 'FAIL'
    ELSE 'PASS'
    END AS test_result
FROM test_ids t
ORDER BY t.test_id;

-- Show overall test results
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM comparison 
            WHERE NOT in_original OR NOT in_denormalized OR NOT all_match
        )
        THEN 'FAIL: Queries return different results'
        ELSE 'PASS: Queries return identical results'
    END AS overall_test_result;

-- Show records that exist only in original query
SELECT 'Only in original query' AS mismatch_type, 
       test_id, 
       id, 
       customer_support_display_name
FROM original_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE in_original AND NOT in_denormalized)
ORDER BY test_id, id;

-- Show records that exist only in denormalized query
SELECT 'Only in denormalized query' AS mismatch_type, 
       test_id, 
       id, 
       customer_support_display_name
FROM denormalized_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE NOT in_original AND in_denormalized)
ORDER BY test_id, id;

-- Show details of fields that differ for matching IDs
SELECT 
    c.test_id,
    c.id,
    t.chat_id,
    field_name,
    original_value,
    denormalized_value
FROM comparison c
JOIN test_ids t ON c.test_id = t.test_id
JOIN LATERAL (
    SELECT 'customer_support_id' AS field_name, 
           o.customer_support_id::TEXT AS original_value, 
           d.customer_support_id::TEXT AS denormalized_value
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.customer_support_id_match
    UNION ALL
    SELECT 'customer_support_display_name', 
           o.customer_support_display_name, 
           d.customer_support_display_name
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.customer_support_display_name_match
    UNION ALL
    SELECT 'end_user_id', 
           o.end_user_id, 
           d.end_user_id
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_id_match
    UNION ALL
    SELECT 'end_user_first_name', 
           o.end_user_first_name, 
           d.end_user_first_name
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_first_name_match
    UNION ALL
    SELECT 'end_user_last_name', 
           o.end_user_last_name, 
           d.end_user_last_name
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_last_name_match
    UNION ALL
    SELECT 'status', 
           o.status, 
           d.status
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.status_match
    UNION ALL
    SELECT 'feedback_text', 
           o.feedback_text, 
           d.feedback_text
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.feedback_text_match
    UNION ALL
    SELECT 'feedback_rating', 
           o.feedback_rating::TEXT, 
           d.feedback_rating::TEXT
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.feedback_rating_match
    UNION ALL
    SELECT 'end_user_email', 
           o.end_user_email, 
           d.end_user_email
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_email_match
    UNION ALL
    SELECT 'end_user_phone', 
           o.end_user_phone, 
           d.end_user_phone
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_phone_match
    UNION ALL
    SELECT 'end_user_os', 
           o.end_user_os, 
           d.end_user_os
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_os_match
    UNION ALL
    SELECT 'end_user_url', 
           o.end_user_url, 
           d.end_user_url
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.end_user_url_match
    UNION ALL
    SELECT 'created', 
           o.created::TEXT, 
           d.created::TEXT
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.created_match
    UNION ALL
    SELECT 'updated', 
           o.updated::TEXT, 
           d.updated::TEXT
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.updated_match
    UNION ALL
    SELECT 'ended', 
           o.ended::TEXT, 
           d.ended::TEXT
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.ended_match
    UNION ALL
    SELECT 'external_id', 
           o.external_id, 
           d.external_id
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.external_id_match
    UNION ALL
    SELECT 'received_from', 
           o.received_from, 
           d.received_from
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.received_from_match
    UNION ALL
    SELECT 'received_from_name', 
           o.received_from_name, 
           d.received_from_name
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.received_from_name_match
    UNION ALL
    SELECT 'forwarded_to_name', 
           o.forwarded_to_name, 
           d.forwarded_to_name
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.forwarded_to_name_match
    UNION ALL
    SELECT 'forwarded_to', 
           o.forwarded_to, 
           d.forwarded_to
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.forwarded_to_match
    UNION ALL
    SELECT 'last_message', 
           o.last_message, 
           d.last_message
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.last_message_match
    UNION ALL
    SELECT 'last_message_timestamp', 
           o.last_message_timestamp::TEXT, 
           d.last_message_timestamp::TEXT
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.last_message_timestamp_match
    UNION ALL
    SELECT 'csa_title', 
           o.csa_title, 
           d.csa_title
    FROM original_query_results o, denormalized_query_results d
    WHERE o.test_id = c.test_id AND o.id = c.id 
      AND d.test_id = c.test_id AND d.id = c.id
      AND NOT c.csa_title_match
) diff ON true
WHERE c.in_original AND c.in_denormalized AND NOT c.all_match
ORDER BY c.test_id, c.id, field_name;

-- Clean up
DROP TABLE test_ids;
DROP TABLE original_query_results;
DROP TABLE denormalized_query_results;
DROP TABLE comparison;