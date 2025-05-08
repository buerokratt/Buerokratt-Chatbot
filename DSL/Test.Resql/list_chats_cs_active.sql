-- Create temporary table for test cases with only limit parameter
CREATE TEMPORARY TABLE test_params (
    test_id SERIAL PRIMARY KEY,
    limit_value INTEGER
);

-- Insert test cases with different limit values
INSERT INTO test_params (limit_value)
VALUES
    (5),    -- Test case 1: Small limit
    (10),   -- Test case 2: Medium limit
    (25),   -- Test case 3: Larger limit
    (50),   -- Test case 4: Very large limit
    (1);    -- Test case 5: Minimal limit

-- Create result tables for each query
CREATE TEMPORARY TABLE original_query_results (
    test_id INTEGER,
    id TEXT,
    row_data JSONB,
    PRIMARY KEY (test_id, id)
);

CREATE TEMPORARY TABLE denormalized_query_results (
    test_id INTEGER,
    id TEXT,
    row_data JSONB,
    PRIMARY KEY (test_id, id)
);

-- Execute tests in a loop
DO $$
DECLARE
    param_record RECORD;
BEGIN
    FOR param_record IN SELECT * FROM test_params
    LOOP
        -- Execute original query with current limit
        EXECUTE '
        WITH
            bot_name AS (
                SELECT value
                FROM configuration
                WHERE NOT deleted AND key = ''bot_institution_id''
                ORDER BY id DESC
                LIMIT 1
            ),

            title_visibility AS (
                SELECT value
                FROM configuration
                WHERE NOT deleted AND key = ''is_csa_title_visible''
                ORDER BY id DESC
                LIMIT 1
            ),

            max_chats AS (
                SELECT MAX(id) AS max_id
                FROM chat
                GROUP BY base_id
            ),

            fulfilled_messages AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE event = ''contact-information-fulfilled''
                GROUP BY chat_base_id
            ),

            message_with_content AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE content <> ''''
                GROUP BY chat_base_id
            ),

            message_with_content_and_not_rating_or_forward AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE
                    event <> ''rating''
                    AND event <> ''requested-chat-forward''
                    AND content <> ''''
                    AND content <> ''message-read''
                GROUP BY chat_base_id
            ),

            messagae_not_rating_or_forward_events AS (
                SELECT MAX(id) AS max_id
                FROM message
                WHERE
                    event <> ''rating''
                    AND event <> ''requested-chat-forward''
                GROUP BY chat_base_id
            ),

            active_chats AS (
                SELECT
                    base_id,
                    customer_support_id,
                    customer_support_display_name,
                    csa_title,
                    end_user_id,
                    end_user_first_name,
                    end_user_last_name,
                    status,
                    created,
                    updated,
                    ended,
                    end_user_email,
                    end_user_phone,
                    end_user_os,
                    end_user_url,
                    external_id,
                    forwarded_to,
                    forwarded_to_name,
                    received_from,
                    received_from_name
                FROM chat
                    CROSS JOIN bot_name
                    INNER JOIN max_chats ON
                        id = max_id
                        AND ended IS NULL
                        AND customer_support_id <> bot_name.value
                        AND status <> ''VALIDATING''
            ),

            contacts_message AS (
                SELECT
                    chat_base_id,
                    content
                FROM message
                    INNER JOIN fulfilled_messages ON id = max_id
            ),

            last_event_message AS (
                SELECT
                    event,
                    chat_base_id
                FROM message
                    INNER JOIN message_with_content ON id = max_id
            ),

            last_content_message AS (
                SELECT
                    content,
                    chat_base_id
                FROM message
                    INNER JOIN message_with_content_and_not_rating_or_forward ON id = max_id
            ),

            messages_update_time AS (
                SELECT
                    updated,
                    chat_base_id
                FROM message
                    INNER JOIN messagae_not_rating_or_forward_events ON id = max_id
            ),

            customer_messages AS (
                SELECT
                    message.chat_base_id,
                    COUNT(message.id) AS messages_count
                FROM message
                WHERE
                    message.author_role = ''end-user''
                    AND (message.event = '''' OR message.event IS NULL)
                GROUP BY message.chat_base_id
            )

        INSERT INTO original_query_results (test_id, id, row_data)
        SELECT
            ' || param_record.test_id || ',
            c.base_id AS id,
            jsonb_build_object(
                ''customer_support_id'', c.customer_support_id,
                ''customer_support_display_name'', c.customer_support_display_name,
                ''end_user_id'', c.end_user_id,
                ''end_user_first_name'', c.end_user_first_name,
                ''end_user_last_name'', c.end_user_last_name,
                ''status'', c.status,
                ''created'', c.created,
                ''updated'', c.updated,
                ''ended'', c.ended,
                ''end_user_email'', c.end_user_email,
                ''end_user_phone'', c.end_user_phone,
                ''end_user_os'', c.end_user_os,
                ''end_user_url'', c.end_user_url,
                ''external_id'', c.external_id,
                ''forwarded_to'', c.forwarded_to,
                ''forwarded_to_name'', c.forwarded_to_name,
                ''received_from'', c.received_from,
                ''received_from_name'', c.received_from_name,
                ''customer_messages'', customer_messages.messages_count,
                ''last_message'', last_content_message.content,
                ''contacts_message'', contacts_message.content,
                ''last_message_timestamp'', messages_update_time.updated,
                ''last_message_event'', last_event_message.event,
                ''csa_title'', CASE WHEN title_visibility.value = ''true'' THEN c.csa_title ELSE '''' END
            ) AS row_data
        FROM active_chats AS c
            LEFT JOIN messages_update_time ON c.base_id = messages_update_time.chat_base_id
            LEFT JOIN last_content_message ON c.base_id = last_content_message.chat_base_id
            LEFT JOIN last_event_message ON c.base_id = last_event_message.chat_base_id
            LEFT JOIN contacts_message ON c.base_id = contacts_message.chat_base_id
            LEFT JOIN customer_messages ON c.base_id = customer_messages.chat_base_id
            CROSS JOIN title_visibility
        ORDER BY created ASC 
        LIMIT ' || param_record.limit_value;

        -- Execute denormalized query with current limit
        EXECUTE '
        WITH latest_chat_versions AS (
            -- First get the latest version of each chat
            SELECT DISTINCT ON (chat_id) *
            FROM denormalized_chat
            ORDER BY chat_id, denormalized_record_created DESC
        )
        
        INSERT INTO denormalized_query_results (test_id, id, row_data)
        SELECT
            ' || param_record.test_id || ',
            chat_id AS id,
            jsonb_build_object(
                ''customer_support_id'', customer_support_id,
                ''customer_support_display_name'', customer_support_display_name,
                ''end_user_id'', end_user_id,
                ''end_user_first_name'', end_user_first_name,
                ''end_user_last_name'', end_user_last_name,
                ''status'', status,
                ''created'', created,
                ''updated'', updated,
                ''ended'', ended,
                ''end_user_email'', end_user_email,
                ''end_user_phone'', end_user_phone,
                ''end_user_os'', end_user_os,
                ''end_user_url'', end_user_url,
                ''external_id'', external_id,
                ''forwarded_to'', forwarded_to,
                ''forwarded_to_name'', forwarded_to_name,
                ''received_from'', received_from,
                ''received_from_name'', received_from_name,
                ''customer_messages'', customer_messages_count,
                ''last_message'', last_message_with_content_and_not_rating_or_forward,
                ''contacts_message'', contacts_message,
                ''last_message_timestamp'', last_message_with_not_rating_or_forward_events_timestamp,
                ''last_message_event'', last_message_event_with_content,
                ''csa_title'', csa_title
            ) AS row_data
            
        FROM latest_chat_versions
        WHERE 
            ended IS NULL 
            AND is_bot = FALSE
            AND status <> ''VALIDATING''
        ORDER BY created ASC
        LIMIT ' || param_record.limit_value;
        
    END LOOP;
END $$;

-- Create comparison table to track differences
CREATE TEMPORARY TABLE comparison AS
SELECT
    o.test_id,
    COALESCE(o.id, d.id) AS id,
    o.id IS NOT NULL AS in_original,
    d.id IS NOT NULL AS in_denormalized,
    o.row_data IS NOT DISTINCT FROM d.row_data AS data_match
FROM original_query_results o
FULL OUTER JOIN denormalized_query_results d ON o.id = d.id AND o.test_id = d.test_id;

-- Summary statistics per test case
SELECT
    p.test_id,
    p.limit_value,
    COUNT(CASE WHEN in_original THEN 1 END) AS original_count,
    COUNT(CASE WHEN in_denormalized THEN 1 END) AS denormalized_count,
    COUNT(CASE WHEN in_original AND in_denormalized THEN 1 END) AS matching_ids_count,
    COUNT(CASE WHEN in_original AND NOT in_denormalized THEN 1 END) AS only_in_original,
    COUNT(CASE WHEN NOT in_original AND in_denormalized THEN 1 END) AS only_in_denormalized,
    COUNT(CASE WHEN in_original AND in_denormalized AND NOT data_match THEN 1 END) AS different_data_count,
    CASE
        WHEN COUNT(CASE WHEN in_original THEN 1 END) <> COUNT(CASE WHEN in_denormalized THEN 1 END) OR
             COUNT(CASE WHEN in_original AND NOT in_denormalized THEN 1 END) > 0 OR
             COUNT(CASE WHEN NOT in_original AND in_denormalized THEN 1 END) > 0 OR
             COUNT(CASE WHEN in_original AND in_denormalized AND NOT data_match THEN 1 END) > 0
        THEN 'FAIL'
        ELSE 'PASS'
    END AS test_result
FROM test_params p
JOIN comparison c ON p.test_id = c.test_id
GROUP BY p.test_id, p.limit_value
ORDER BY p.test_id;

-- Show overall test result
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
SELECT 'Records only in original query:' AS detail_type;
SELECT 
    c.test_id,
    p.limit_value,
    c.id, 
    o.row_data->>'customer_support_display_name' AS display_name,
    o.row_data->>'status' AS status
FROM comparison c
JOIN original_query_results o ON c.test_id = o.test_id AND c.id = o.id
JOIN test_params p ON c.test_id = p.test_id
WHERE in_original AND NOT in_denormalized
ORDER BY c.test_id, c.id
LIMIT 20;

-- Show records that exist only in denormalized query
SELECT 'Records only in denormalized query:' AS detail_type;
SELECT 
    c.test_id,
    p.limit_value,
    c.id, 
    d.row_data->>'customer_support_display_name' AS display_name,
    d.row_data->>'status' AS status
FROM comparison c
JOIN denormalized_query_results d ON c.test_id = d.test_id AND c.id = d.id
JOIN test_params p ON c.test_id = p.test_id
WHERE NOT in_original AND in_denormalized
ORDER BY c.test_id, c.id
LIMIT 20;

-- Show detailed field differences for records that exist in both queries but have different data
SELECT 'Field value differences:' AS detail_type;
SELECT
    c.test_id,
    p.limit_value,
    c.id,
    key AS field_name,
    o.row_data->key AS original_value,
    d.row_data->key AS denormalized_value
FROM comparison c
JOIN original_query_results o ON c.test_id = o.test_id AND c.id = o.id
JOIN denormalized_query_results d ON c.test_id = d.test_id AND c.id = d.id
JOIN test_params p ON c.test_id = p.test_id
CROSS JOIN jsonb_object_keys(o.row_data) AS key
WHERE in_original AND in_denormalized AND NOT data_match
  AND o.row_data->key IS DISTINCT FROM d.row_data->key
ORDER BY c.test_id, c.id, key
LIMIT 50;

DROP TABLE test_params;
DROP TABLE original_query_results;
DROP TABLE denormalized_query_results;
DROP TABLE comparison;