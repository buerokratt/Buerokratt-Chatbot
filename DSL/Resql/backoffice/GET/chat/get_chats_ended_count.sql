WITH
    max_chats AS (
        SELECT COUNT(*) AS total_count
        FROM chat.chat
        WHERE
            ended IS NOT NULL
            AND status = 'ENDED'
            AND created::DATE BETWEEN :start::date AND :end::date
    )

SELECT total_count
FROM max_chats;
