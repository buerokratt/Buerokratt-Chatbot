-- Create temporary tables for test setup
CREATE TEMPORARY TABLE test_params (
    test_id SERIAL PRIMARY KEY,
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE,
    row_limit INTEGER DEFAULT 100  -- Changed from 'limit' to 'row_limit'
);

-- Insert various test cases to cover different scenarios
INSERT INTO test_params (start_date, end_date, row_limit)
-- Test case 1: Default parameters - 30 days with limit 100
VALUES (CURRENT_DATE - INTERVAL '1000 days', CURRENT_DATE, 100)
-- Test case 2: Last 7 days with limit 50
UNION ALL
VALUES (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE, 50)
-- Test case 3: Previous month with limit 200
UNION ALL
VALUES (
    DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
    DATE_TRUNC('month', CURRENT_DATE)::DATE - INTERVAL '1 day',
    200
)
-- Test case 4: Small date range with limit 25
UNION ALL
VALUES (CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE, 25)
-- Test case 5: Wide date range with small limit
UNION ALL
VALUES (CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE, 10)
-- Test case 6: Today only with large limit
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, 500)
-- Test case 7: Date in the past with medium limit
UNION ALL
VALUES (
    CURRENT_DATE - INTERVAL '60 days',
    CURRENT_DATE - INTERVAL '45 days',
    75
);

-- Log test cases
SELECT 'Running test case ' || test_id AS test_case,
       start_date, end_date, row_limit
FROM test_params;

-- Create result tables for each query
CREATE TEMPORARY TABLE original_query_results (
    test_id INTEGER,
    id TEXT,
    result_data JSONB,
    PRIMARY KEY (test_id, id)
);

CREATE TEMPORARY TABLE denormalized_query_results (
    test_id INTEGER,
    id TEXT,
    result_data JSONB,
    PRIMARY KEY (test_id, id)
);

-- Execute each test case
DO $$
DECLARE
    param_record RECORD;
BEGIN
    FOR param_record IN SELECT * FROM test_params
    LOOP
        -- Original query
        EXECUTE 'WITH
            title_visibility AS (
                SELECT value
                FROM configuration
                WHERE NOT deleted AND key = ''is_csa_title_visible''
                ORDER BY id DESC
                LIMIT 1
            ),

            fulfilled_messages AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE event = ''contact-information-fulfilled''
                GROUP BY chat_base_id
            ),

            contacts_message AS (
                SELECT
                    chat_base_id,
                    content
                FROM message
                    INNER JOIN fulfilled_messages ON id = max_id
            ),

            max_chats AS (
                SELECT MAX(id) AS max_id
                FROM chat
                GROUP BY base_id
            ),

            unavailable_ended_chats AS (
                SELECT
                    base_id,
                    customer_support_id,
                    customer_support_display_name,
                    csa_title,
                    end_user_id,
                    end_user_first_name,
                    end_user_last_name,
                    end_user_email,
                    end_user_phone,
                    end_user_os,
                    end_user_url,
                    status,
                    updated,
                    ended,
                    forwarded_to_name,
                    received_from,
                    labels,
                    created
                FROM chat
                    INNER JOIN max_chats ON
                        id = max_id
                        AND ended IS NOT null
            ),

            max_messages AS (
                SELECT MAX(id) AS max_id
                FROM message
                GROUP BY chat_base_id
            ),

            messages_update_time AS (
                SELECT
                    updated,
                    chat_base_id,
                    LOWER(event) AS event_lowercase,
                    (
                        CASE
                            WHEN event = '''' THEN null
                            ELSE LOWER(event)
                        END
                    ) AS last_message_event
                FROM message
                    INNER JOIN max_messages ON id = max_id
            ),

            message_with_content AS (
                SELECT
                    MAX(id) AS max_id,
                    MIN(id) AS min_id
                FROM message
                WHERE
                    content <> ''''
                    AND content <> ''message-read''
                GROUP BY chat_base_id
            ),

            first_content_message AS (
                SELECT
                    created,
                    chat_base_id
                FROM message
                    INNER JOIN message_with_content ON message.id = message_with_content.min_id
            ),

            last_content_message AS (
                SELECT
                    content,
                    chat_base_id
                FROM message
                    INNER JOIN message_with_content ON message.id = message_with_content.max_id
            ),

            max_chat_history_comments AS (
                SELECT MAX(id) AS max_id
                FROM chat_history_comments
                GROUP BY chat_id
            ),

            chat_history_comments AS (
                SELECT
                    comment,
                    chat_id
                FROM chat_history_comments
                    INNER JOIN max_chat_history_comments ON id = max_id
            ),
            
            final_results AS (
                SELECT
                    c.base_id AS id,
                    jsonb_build_object(
                        ''customer_support_id'', c.customer_support_id,
                        ''customer_support_display_name'', c.customer_support_display_name,
                        ''end_user_id'', c.end_user_id,
                        ''end_user_first_name'', c.end_user_first_name,
                        ''end_user_last_name'', c.end_user_last_name,
                        ''end_user_email'', c.end_user_email,
                        ''end_user_phone'', c.end_user_phone,
                        ''end_user_os'', c.end_user_os,
                        ''end_user_url'', c.end_user_url,
                        ''status'', c.status,
                        ''created'', first_content_message.created,
                        ''updated'', c.updated,
                        ''ended'', c.ended,
                        ''forwarded_to_name'', c.forwarded_to_name,
                        ''received_from'', c.received_from,
                        ''labels'', c.labels,
                        ''comment'', s.comment,
                        ''last_message'', last_content_message.content,
                        ''last_message_event'', messages_update_time.last_message_event,
                        ''contacts_message'', contacts_message.content,
                        ''last_message_timestamp'', messages_update_time.updated,
                        ''csa_title'', CASE WHEN title_visibility.value = ''true'' THEN c.csa_title ELSE '''' END
                    ) AS result_data
                FROM unavailable_ended_chats AS c
                    LEFT JOIN messages_update_time ON c.base_id = messages_update_time.chat_base_id
                    LEFT JOIN chat_history_comments AS s ON s.chat_id = messages_update_time.chat_base_id 
                    LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
                    LEFT JOIN first_content_message ON c.base_id = first_content_message.chat_base_id
                    LEFT JOIN contacts_message ON c.base_id = contacts_message.chat_base_id
                    CROSS JOIN title_visibility
                WHERE
                    c.created::DATE BETWEEN $1::date AND $2::date
                    AND messages_update_time.event_lowercase IN (
                        ''unavailable_holiday'',
                        ''unavailable-contact-information-fulfilled'',
                        ''contact-information-skipped'',
                        ''unavailable_organization'',
                        ''unavailable_csas'',
                        ''unavailable_csas_ask_contacts''
                    )
                ORDER BY c.created ASC 
                LIMIT $3
            )
            
            INSERT INTO original_query_results (test_id, id, result_data)
            SELECT $4, id, result_data FROM final_results'
        USING 
            param_record.start_date,
            param_record.end_date,
            param_record.row_limit,
            param_record.test_id;

        -- Denormalized query with ROW_NUMBER()
        EXECUTE 'WITH latest_chat_records AS (
                SELECT *
                FROM (
                    SELECT
                        chat_id,
                        customer_support_id,
                        customer_support_display_name,
                        end_user_id,
                        end_user_first_name,
                        end_user_last_name,
                        end_user_email,
                        end_user_phone,
                        end_user_os,
                        end_user_url,
                        status,
                        first_message_timestamp,
                        updated,
                        ended,
                        forwarded_to_name,
                        received_from,
                        labels,
                        comment,
                        last_message,
                        contacts_message,
                        last_message_timestamp,
                        csa_title,
                        CASE WHEN last_message_event IS NULL OR last_message_event = '''' THEN NULL 
                        ELSE last_message_event END AS last_message_event,
                        created,
                        ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY id DESC) as rn
                    FROM denormalized_chat
                    WHERE created::DATE BETWEEN $1::date AND $2::date
                ) AS subquery
                WHERE rn = 1
                  AND ended IS NOT NULL
            ),
            
            final_results AS (
                SELECT
                    chat_id AS id,
                    jsonb_build_object(
                        ''customer_support_id'', customer_support_id,
                        ''customer_support_display_name'', customer_support_display_name,
                        ''end_user_id'', end_user_id,
                        ''end_user_first_name'', end_user_first_name,
                        ''end_user_last_name'', end_user_last_name,
                        ''end_user_email'', end_user_email,
                        ''end_user_phone'', end_user_phone,
                        ''end_user_os'', end_user_os,
                        ''end_user_url'', end_user_url,
                        ''status'', status,
                        ''created'', first_message_timestamp,
                        ''updated'', updated,
                        ''ended'', ended,
                        ''forwarded_to_name'', forwarded_to_name,
                        ''received_from'', received_from,
                        ''labels'', labels,
                        ''comment'', comment,
                        ''last_message'', last_message,
                        ''last_message_event'', last_message_event,
                        ''contacts_message'', contacts_message,
                        ''last_message_timestamp'', last_message_timestamp,
                        ''csa_title'', csa_title
                    ) AS result_data
                FROM latest_chat_records
                WHERE
                    last_message_event IN (
                        ''unavailable_holiday'',
                        ''unavailable-contact-information-fulfilled'',
                        ''contact-information-skipped'',
                        ''unavailable_organization'',
                        ''unavailable_csas'',
                        ''unavailable_csas_ask_contacts''
                    )
                ORDER BY created ASC 
                LIMIT $3
            )
            
            INSERT INTO denormalized_query_results (test_id, id, result_data)
            SELECT $4, id, result_data FROM final_results'
        USING 
            param_record.start_date,
            param_record.end_date,
            param_record.row_limit,
            param_record.test_id;
    END LOOP;
END $$;

-- Create comparison table to track differences
CREATE TEMPORARY TABLE comparison AS
SELECT
    o.test_id,
    COALESCE(o.id, d.id) AS id,
    o.id IS NOT NULL AS in_original,
    d.id IS NOT NULL AS in_denormalized,
    o.result_data = d.result_data AS data_match,
    CASE
        WHEN o.result_data IS NULL OR d.result_data IS NULL THEN NULL
        ELSE jsonb_object_agg(
            key,
            CASE
                WHEN o.result_data->key IS DISTINCT FROM d.result_data->key
                THEN jsonb_build_object('original', o.result_data->key, 'denormalized', d.result_data->key)
                ELSE NULL
            END
        ) FILTER (WHERE o.result_data->key IS DISTINCT FROM d.result_data->key)
    END AS differing_fields
FROM original_query_results o
FULL OUTER JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id,
LATERAL jsonb_object_keys(COALESCE(o.result_data, '{}'::jsonb) || COALESCE(d.result_data, '{}'::jsonb)) AS key
GROUP BY o.test_id, o.id, d.id, o.result_data, d.result_data;

-- Show summary statistics per test case
SELECT
    p.test_id,
    'Running test case ' || p.test_id AS test_case,
    p.start_date, 
    p.end_date, 
    p.row_limit,
    (SELECT COUNT(*) FROM original_query_results WHERE test_id = p.test_id) AS original_count,
    (SELECT COUNT(*) FROM denormalized_query_results WHERE test_id = p.test_id) AS denormalized_count,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND in_denormalized) AS matching_ids_count,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND NOT in_denormalized) AS only_in_original,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND NOT in_original AND in_denormalized) AS only_in_denormalized,
    (SELECT COUNT(*) FROM comparison WHERE test_id = p.test_id AND in_original AND in_denormalized AND NOT data_match) AS different_data_count
FROM test_params p
ORDER BY p.test_id;

-- Show overall test results
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM comparison 
            WHERE 
                NOT in_original OR 
                NOT in_denormalized OR 
                NOT data_match
        )
        THEN 'FAIL: Queries return different results'
        ELSE 'PASS: Queries return identical results'
    END AS overall_test_result;

-- Show records that exist only in original query (if any)
SELECT 'Only in original query' AS mismatch_type, 
       test_id, 
       id, 
       result_data->>'customer_support_display_name' AS display_name
FROM original_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE in_original AND NOT in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show records that exist only in denormalized query (if any)
SELECT 'Only in denormalized query' AS mismatch_type, 
       test_id, 
       id, 
       result_data->>'customer_support_display_name' AS display_name
FROM denormalized_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE NOT in_original AND in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show details of fields that differ for matching IDs (if any)
SELECT 
    'Field differences' AS mismatch_type,
    test_id,
    id,
    differing_fields
FROM comparison
WHERE in_original AND in_denormalized AND NOT data_match
ORDER BY test_id, id
LIMIT 10;

-- Show a detailed breakdown of differences per field (if any)
SELECT
    'Field difference statistics' AS analysis_type,
    key AS field_name,
    COUNT(*) AS total_differences
FROM comparison c,
LATERAL jsonb_object_keys(COALESCE(c.differing_fields, '{}'::jsonb)) AS key
WHERE differing_fields IS NOT NULL
GROUP BY key
ORDER BY COUNT(*) DESC;

-- Identify potential ordering issues (if the same records appear but in different order)
WITH original_set AS (
    SELECT test_id, ARRAY_AGG(id ORDER BY id) AS ids
    FROM original_query_results
    GROUP BY test_id
),
denormalized_set AS (
    SELECT test_id, ARRAY_AGG(id ORDER BY id) AS ids
    FROM denormalized_query_results
    GROUP BY test_id
)
SELECT 
    o.test_id,
    'Potential ordering issue detected' AS issue_type,
    o.ids = d.ids AS same_set_of_ids,
    array_length(o.ids, 1) AS original_count,
    array_length(d.ids, 1) AS denormalized_count
FROM original_set o
JOIN denormalized_set d ON o.test_id = d.test_id
WHERE o.ids <> d.ids AND array_length(o.ids, 1) = array_length(d.ids, 1);

-- Clean up
DROP TABLE IF EXISTS test_params CASCADE;
DROP TABLE IF EXISTS original_query_results CASCADE;
DROP TABLE IF EXISTS denormalized_query_results CASCADE;
DROP TABLE IF EXISTS comparison CASCADE;