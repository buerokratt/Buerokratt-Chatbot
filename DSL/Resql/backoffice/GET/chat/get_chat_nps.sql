WITH rated_chats AS (
    SELECT MAX(feedback_rating) AS rating
    FROM chat.chat
    WHERE feedback_rating IS NOT NULL
    GROUP BY base_id
),
nps_calc AS (
    SELECT 
        COUNT(*) AS total,
        COUNT(CASE WHEN rating >= 9 THEN 1 END) AS promoters,
        COUNT(CASE WHEN rating <= 6 THEN 1 END) AS detractors
    FROM rated_chats
)
SELECT 
    ROUND(
        ((promoters * 100.0) / NULLIF(total, 0)) - 
        ((detractors * 100.0) / NULLIF(total, 0)),
        2
    ) AS nps
FROM nps_calc;