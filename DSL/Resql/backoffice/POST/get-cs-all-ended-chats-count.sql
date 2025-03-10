WITH MaxChats AS (
    SELECT COUNT(*) AS total_count
    FROM chat
    WHERE ended IS NOT NULL
      AND status = 'ENDED'
      AND created::date BETWEEN :start::date AND :end::date
    )
SELECT total_count
FROM MaxChats;