-- Test file to verify both queries return the same result

-- First, let's save both query results to temporary tables
CREATE TEMPORARY TABLE original_query_result AS
WITH
    ended_chats AS (
        SELECT
            id,
            base_id
        FROM chat
        WHERE
            id IN (
                SELECT MAX(id) FROM chat
                GROUP BY base_id
            )
            AND ended IS NOT NULL
            AND ended > (NOW() - '1 month'::INTERVAL)
            AND customer_support_id <> ''
            AND customer_support_id <> (
                SELECT value
                FROM configuration
                WHERE
                    key = 'bot_institution_id'
                    AND id IN (
                        SELECT MAX(id) FROM configuration
                        GROUP BY key
                    )
                    AND deleted = FALSE
            )
    )

SELECT
    COALESCE(SUM(ABS(EXTRACT(
        EPOCH FROM
        (
            SELECT author_timestamp
            FROM message
            WHERE id IN (
                SELECT MIN(id)
                FROM message
                WHERE
                    chat_base_id = c.base_id
                    AND author_role = 'backoffice-user'
            )
        )
        - (
            SELECT author_timestamp
            FROM message
            WHERE id IN (
                SELECT MAX(id)
                FROM message
                WHERE chat_base_id = c.base_id
            )
        )
    ))), 0) AS duration_in_seconds
FROM chat AS c
    RIGHT JOIN ended_chats AS ec ON c.id = ec.id;

CREATE TEMPORARY TABLE new_query_result AS
SELECT
    SUM(chat_duration_in_seconds) AS duration_in_seconds
FROM (
    SELECT DISTINCT ON (chat_id)
        chat_id,
        chat_duration_in_seconds,
        ended,
        customer_support_id,
        is_bot
    FROM denormalized_chat
    ORDER BY chat_id, id DESC
) latest_chats
WHERE
    ended IS NOT NULL
    AND ended > (NOW() - '1 month'::INTERVAL)
    AND customer_support_id <> ''
    AND is_bot = FALSE;

-- Now compare the results and report PASS/FAIL
DO $$
DECLARE
    original_result NUMERIC;
    new_result NUMERIC;
    result_message TEXT;
BEGIN
    SELECT duration_in_seconds INTO original_result FROM original_query_result;
    SELECT duration_in_seconds INTO new_result FROM new_query_result;
    
    -- Use round to account for potential floating point precision differences
    IF ROUND(COALESCE(original_result, 0), 2) = ROUND(COALESCE(new_result, 0), 2) THEN
        result_message := 'PASS: Queries return identical results';
    ELSE
        result_message := 'FAIL: Queries return different results. Original: ' || 
                          COALESCE(original_result, 0) || ', New: ' || 
                          COALESCE(new_result, 0);
    END IF;
    
    RAISE NOTICE '%', result_message;
END $$;

-- Cleanup
DROP TABLE original_query_result;
DROP TABLE new_query_result;

-- Alternative test version (returns comparison as a query result)
SELECT
    CASE
        WHEN ABS(original.duration - new.duration) = 0
        THEN 'PASS: Queries return identical results'
        ELSE 'FAIL: Queries return different results. Original: ' || 
             original.duration || ', New: ' || new.duration
    END AS test_result
FROM
    (
        WITH
            ended_chats AS (
                SELECT
                    id,
                    base_id
                FROM chat
                WHERE
                    id IN (
                        SELECT MAX(id) FROM chat
                        GROUP BY base_id
                    )
                    AND ended IS NOT NULL
                    AND ended > (NOW() - '1 month'::INTERVAL)
                    AND customer_support_id <> ''
                    AND customer_support_id <> (
                        SELECT value
                        FROM configuration
                        WHERE
                            key = 'bot_institution_id'
                            AND id IN (
                                SELECT MAX(id) FROM configuration
                                GROUP BY key
                            )
                            AND deleted = FALSE
                    )
            )

        SELECT
            COALESCE(SUM(ABS(EXTRACT(
                EPOCH FROM
                (
                    SELECT author_timestamp
                    FROM message
                    WHERE id IN (
                        SELECT MIN(id)
                        FROM message
                        WHERE
                            chat_base_id = c.base_id
                            AND author_role = 'backoffice-user'
                    )
                )
                - (
                    SELECT author_timestamp
                    FROM message
                    WHERE id IN (
                        SELECT MAX(id)
                        FROM message
                        WHERE chat_base_id = c.base_id
                    )
                )
            ))), 0) AS duration
        FROM chat AS c
            RIGHT JOIN ended_chats AS ec ON c.id = ec.id
    ) AS original,
    (
        SELECT
            COALESCE(SUM(chat_duration_in_seconds), 0) AS duration
        FROM (
            SELECT DISTINCT ON (chat_id)
                chat_id,
                chat_duration_in_seconds
            FROM denormalized_chat
            WHERE
                ended IS NOT NULL
                AND ended > (NOW() - '1 month'::INTERVAL)
                AND customer_support_id <> ''
                AND is_bot = FALSE
            ORDER BY chat_id, id DESC
        ) latest_chats
    ) AS new;

