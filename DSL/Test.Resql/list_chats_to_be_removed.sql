-- Create temporary tables for test setup
CREATE TEMPORARY TABLE test_params (
    test_id SERIAL PRIMARY KEY,
    auth_date DATE DEFAULT CURRENT_DATE,
    anon_date DATE DEFAULT CURRENT_DATE,
    search TEXT DEFAULT NULL,
    sorting TEXT DEFAULT 'id desc',
    page INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10
);

-- Insert various test cases to cover different scenarios
INSERT INTO test_params (auth_date, anon_date, search, sorting, page, page_size)
-- Test case 1: Default parameters
VALUES (CURRENT_DATE, CURRENT_DATE, NULL, 'id desc', 1, 10)
-- Test case 2: Search by partial name
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, 
       (SELECT SUBSTRING(customer_support_display_name, 1, 3) 
        FROM chat 
        WHERE customer_support_display_name IS NOT NULL AND LENGTH(customer_support_display_name) > 3
        LIMIT 1),
       'id asc', 1, 5)
-- Test case 3: Search by chat ID
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE,
       (SELECT SUBSTRING(base_id, 1, 5)
        FROM chat
        WHERE base_id IS NOT NULL
        LIMIT 1),
       'created desc', 1, 10)
-- Test case 4: Different sort order
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, NULL, 'ended desc', 1, 15)
-- Test case 5: Different sort column
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, NULL, 'created desc', 1, 10)
-- Test case 6: Pagination test - page 2
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, NULL, 'created asc', 2, 5)
-- Test case 7: Pagination test - page 3 with larger page size
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, NULL, 'ended asc', 3, 8)
-- Test case 8: Search with special characters
UNION ALL
VALUES (CURRENT_DATE, CURRENT_DATE, '%', 'id desc', 1, 10)
-- Test case 9: Past dates
UNION ALL
VALUES (CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '30 days', 'tere', 'id desc', 1, 10)
-- Test case 10: Past dates with pagination and search
UNION ALL
VALUES (CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '30 days', 'tere', 'id desc', 2, 30)
-- Test case 11: Mix of parameters
UNION ALL
VALUES (CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '7 days', 
       (SELECT SUBSTRING(comment, 1, 3)
        FROM chat_history_comments
        WHERE comment IS NOT NULL AND LENGTH(comment) > 3
        LIMIT 1),
       'comment desc', 2, 15);

-- Log test cases
SELECT 'Running test case ' || test_id AS test_case,
       auth_date, anon_date, search, sorting, page, page_size
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

            title_visibility AS (
                SELECT value
                FROM configuration
                WHERE
                    key = ''is_csa_title_visible''
                    AND NOT deleted
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

            max_messages AS (
                SELECT MAX(id) AS max_id
                FROM message
                GROUP BY chat_base_id
            ),

            messages AS (
                SELECT
                    event,
                    updated,
                    chat_base_id
                FROM message
                    INNER JOIN max_messages ON id = max_id
            ),

            max_chats AS (
                SELECT MAX(id) AS max_id
                FROM chat
                WHERE
                    ended IS NOT NULL
                    AND status <> ''IDLE''
                    AND (
                        (
                            end_user_id IS NOT NULL
                            AND end_user_id <> ''''
                            AND ended::DATE <= $1::DATE
                        )
                        OR
                        (
                            end_user_id IS NULL
                            OR end_user_id = '''' AND ended::DATE <= $2::DATE
                        )
                    )
                GROUP BY base_id
            ),

            ended_chat_messages AS (
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
                    created,
                    feedback_text,
                    feedback_rating
                FROM chat
                    RIGHT JOIN max_chats ON id = max_id
            ),

            rated_chats AS (
                SELECT MAX(feedback_rating) AS rating
                FROM chat
                WHERE feedback_rating IS NOT NULL
                GROUP BY base_id
            ),

            rated_chats_count AS (
                SELECT COUNT(rating) AS total FROM rated_chats
            ),

            promoters AS (
                SELECT COUNT(rating) AS p FROM rated_chats
                WHERE rating >= 9
            ),

            detractors AS (
                SELECT COUNT(rating) AS d FROM rated_chats
                WHERE rating <= 6
            ),

            nps AS (
                SELECT
                    ROUND(
                        ((p / (GREATEST(total, 1) * 1.0)) - (d / (GREATEST(total, 1) * 1.0)))
                        * 100.0,
                        2
                    ) AS nps
                FROM rated_chats_count
                    CROSS JOIN promoters
                    CROSS JOIN detractors
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
                        ''contacts_message'', contacts_message.content,
                        ''last_message_timestamp'', m.updated,
                        ''feedback_text'', c.feedback_text,
                        ''feedback_rating'', c.feedback_rating,
                        ''nps'', nps.nps,
                        ''csa_title'', CASE WHEN title_visibility.value = ''true'' THEN c.csa_title ELSE '''' END,
                        ''last_message_event'', CASE WHEN m.event = '''' THEN NULL ELSE LOWER(m.event) END,
                        ''total_pages'', CEIL(COUNT(*) OVER () / $6::DECIMAL)
                    ) AS result_data
                FROM ended_chat_messages AS c
                    INNER JOIN messages AS m ON c.base_id = m.chat_base_id
                    LEFT JOIN chat_history_comments AS s ON m.chat_base_id = s.chat_id
                    INNER JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
                    INNER JOIN first_content_message ON c.base_id = first_content_message.chat_base_id
                    LEFT JOIN contacts_message ON c.base_id = contacts_message.chat_base_id
                    CROSS JOIN title_visibility
                    CROSS JOIN nps
                WHERE (
                    $3 IS NULL
                    OR $3 = ''''
                    OR LOWER(c.customer_support_display_name) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(c.end_user_first_name) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(contacts_message.content) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(s.comment) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(c.status) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(m.event) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(c.base_id) LIKE LOWER(''%'' || $3 || ''%'')
                    OR TO_CHAR(first_content_message.created, ''DD.MM.YYYY HH24:MI:SS'') LIKE ''%'' || $3 || ''%''
                    OR TO_CHAR(c.ended, ''DD.MM.YYYY HH24:MI:SS'') LIKE ''%'' || $3 || ''%''
                    OR EXISTS (
                        SELECT 1
                        FROM message AS msg
                        WHERE
                            msg.chat_base_id = c.base_id
                            AND LOWER(msg.content) LIKE LOWER(''%'' || $3 || ''%'')
                    )
                )
                ORDER BY
                    CASE WHEN $4 = ''created asc'' THEN first_content_message.created END ASC,
                    CASE WHEN $4 = ''created desc'' THEN first_content_message.created END DESC,
                    CASE WHEN $4 = ''ended asc'' THEN c.ended END ASC,
                    CASE WHEN $4 = ''ended desc'' THEN c.ended END DESC,
                    CASE WHEN $4 = ''customerSupportDisplayName asc'' THEN c.customer_support_display_name END ASC,
                    CASE WHEN $4 = ''customerSupportDisplayName desc'' THEN c.customer_support_display_name END DESC,
                    CASE WHEN $4 = ''endUserName asc'' THEN c.end_user_first_name END ASC,
                    CASE WHEN $4 = ''endUserName desc'' THEN c.end_user_first_name END DESC,
                    CASE WHEN $4 = ''endUserId asc'' THEN c.end_user_id END ASC,
                    CASE WHEN $4 = ''endUserId desc'' THEN c.end_user_id END DESC,
                    CASE WHEN $4 = ''contactsMessage asc'' THEN contacts_message.content END ASC,
                    CASE WHEN $4 = ''contactsMessage desc'' THEN contacts_message.content END DESC,
                    CASE WHEN $4 = ''comment asc'' THEN s.comment END ASC,
                    CASE WHEN $4 = ''comment desc'' THEN s.comment END DESC,
                    CASE WHEN $4 = ''labels asc'' THEN c.labels END ASC,
                    CASE WHEN $4 = ''labels desc'' THEN c.labels END DESC,
                    CASE WHEN $4 = ''status asc'' THEN c.status END ASC,
                    CASE WHEN $4 = ''status desc'' THEN c.status END DESC,
                    CASE WHEN $4 = ''id asc'' THEN c.base_id END ASC,
                    CASE WHEN $4 = ''id desc'' THEN c.base_id END DESC
                LIMIT $6 OFFSET ((GREATEST($5, 1) - 1) * $6)
            )
            
            INSERT INTO original_query_results (test_id, id, result_data)
            SELECT $7, id, result_data FROM final_results'
        USING 
            param_record.auth_date,
            param_record.anon_date,
            param_record.search,
            param_record.sorting,
            param_record.page,
            param_record.page_size,
            param_record.test_id;

        -- Denormalized query
        EXECUTE 'WITH latest_chat_records AS (
                SELECT DISTINCT ON (chat_id)
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
                    feedback_text,
                    feedback_rating,
                    nps,
                    csa_title,
                    last_message_event
                FROM denormalized_chat
                WHERE (
                        (
                            ended IS NOT NULL
                            AND status <> ''IDLE''
                            AND (
                                (
                                    end_user_id IS NOT NULL
                                    AND end_user_id <> ''''
                                    AND ended::DATE <= $1::DATE
                                )
                                OR
                                (
                                    end_user_id IS NULL
                                    OR end_user_id = '''' AND ended::DATE <= $2::DATE
                                )
                            )
                            AND first_message <> ''''
                            AND first_message <> ''message-read''
                            AND last_message <> ''''
                            AND last_message <> ''message-read''
                        )
                )
                ORDER BY chat_id, id DESC
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
                        ''contacts_message'', contacts_message,
                        ''last_message_timestamp'', last_message_timestamp,
                        ''feedback_text'', feedback_text,
                        ''feedback_rating'', feedback_rating,
                        ''nps'', nps,
                        ''csa_title'', csa_title,
                        ''last_message_event'', last_message_event,
                        ''total_pages'', CEIL(COUNT(*) OVER () / $6::DECIMAL)
                    ) AS result_data
                FROM latest_chat_records
                WHERE (
                    $3 IS NULL
                    OR $3 = ''''
                    OR LOWER(customer_support_display_name) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(end_user_first_name) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(contacts_message) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(comment) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(status) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(last_message_event) LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(chat_id) LIKE LOWER(''%'' || $3 || ''%'')
                    OR TO_CHAR(first_message_timestamp, ''DD.MM.YYYY HH24:MI:SS'') LIKE LOWER(''%'' || $3 || ''%'')
                    OR TO_CHAR(ended, ''DD.MM.YYYY HH24:MI:SS'') LIKE LOWER(''%'' || $3 || ''%'')
                    OR LOWER(last_message) LIKE LOWER(''%'' || $3 || ''%'')
                    OR EXISTS (SELECT 1
                        FROM denormalized_chat AS dc
                        WHERE dc.chat_id = latest_chat_records.chat_id
                            AND (LOWER(dc.last_message) LIKE LOWER(''%'' || $3 || ''%'') OR LOWER(dc.first_message) LIKE LOWER(''%'' || $3 || ''%'')))
                )
                ORDER BY
                    CASE WHEN $4 = ''created asc'' THEN first_message_timestamp END ASC,
                    CASE WHEN $4 = ''created desc'' THEN first_message_timestamp END DESC,
                    CASE WHEN $4 = ''ended asc'' THEN ended END ASC,
                    CASE WHEN $4 = ''ended desc'' THEN ended END DESC,
                    CASE WHEN $4 = ''customerSupportDisplayName asc'' THEN customer_support_display_name END ASC,
                    CASE WHEN $4 = ''customerSupportDisplayName desc'' THEN customer_support_display_name END DESC,
                    CASE WHEN $4 = ''endUserName asc'' THEN end_user_first_name END ASC,
                    CASE WHEN $4 = ''endUserName desc'' THEN end_user_first_name END DESC,
                    CASE WHEN $4 = ''endUserId asc'' THEN end_user_id END ASC,
                    CASE WHEN $4 = ''endUserId desc'' THEN end_user_id END DESC,
                    CASE WHEN $4 = ''contactsMessage asc'' THEN contacts_message END ASC,
                    CASE WHEN $4 = ''contactsMessage desc'' THEN contacts_message END DESC,
                    CASE WHEN $4 = ''comment asc'' THEN comment END ASC,
                    CASE WHEN $4 = ''comment desc'' THEN comment END DESC,
                    CASE WHEN $4 = ''labels asc'' THEN labels END ASC,
                    CASE WHEN $4 = ''labels desc'' THEN labels END DESC,
                    CASE WHEN $4 = ''status asc'' THEN status END ASC,
                    CASE WHEN $4 = ''status desc'' THEN status END DESC,
                    CASE WHEN $4 = ''id asc'' THEN chat_id END ASC,
                    CASE WHEN $4 = ''id desc'' THEN chat_id END DESC
                LIMIT $6 OFFSET ((GREATEST($5, 1) - 1) * $6)
            )
            
            INSERT INTO denormalized_query_results (test_id, id, result_data)
            SELECT $7, id, result_data FROM final_results'
        USING 
            param_record.auth_date,
            param_record.anon_date,
            param_record.search,
            param_record.sorting,
            param_record.page,
            param_record.page_size,
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
    p.auth_date, 
    p.anon_date, 
    p.search, 
    p.sorting, 
    p.page, 
    p.page_size,
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

-- Show records that exist only in original query
SELECT 'Only in original query' AS mismatch_type, 
       test_id, 
       id, 
       result_data->>'customer_support_display_name' AS display_name
FROM original_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE in_original AND NOT in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show records that exist only in denormalized query
SELECT 'Only in denormalized query' AS mismatch_type, 
       test_id, 
       id, 
       result_data->>'customer_support_display_name' AS display_name
FROM denormalized_query_results
WHERE (test_id, id) IN (SELECT test_id, id FROM comparison WHERE NOT in_original AND in_denormalized)
ORDER BY test_id, id
LIMIT 10;

-- Show details of fields that differ for matching IDs
SELECT 
    'Field differences' AS mismatch_type,
    test_id,
    id,
    differing_fields
FROM comparison
WHERE in_original AND in_denormalized AND NOT data_match
ORDER BY test_id, id
LIMIT 10;

-- Show a detailed breakdown of differences per field
SELECT
    'Field difference statistics' AS analysis_type,
    key AS field_name,
    COUNT(*) AS total_differences
FROM comparison c,
LATERAL jsonb_object_keys(COALESCE(c.differing_fields, '{}'::jsonb)) AS key
WHERE differing_fields IS NOT NULL
GROUP BY key
ORDER BY COUNT(*) DESC;

-- Clean up
DROP TABLE IF EXISTS test_params;
DROP TABLE IF EXISTS original_query_results;
DROP TABLE IF EXISTS denormalized_query_results;
DROP TABLE IF EXISTS comparison;