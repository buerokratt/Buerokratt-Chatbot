WITH LatestChats AS (
    SELECT DISTINCT ON (base_id) base_id, preserve, ended, status, end_user_id
    FROM chat
    ORDER BY base_id, id DESC
)
SELECT base_id
FROM LatestChats
WHERE ended IS NOT NULL
  AND status = 'ENDED'
  AND end_user_id = ''
  AND ended < :fromDate::timestamp with time zone
  AND (preserve IS NULL OR preserve IS NOT TRUE);
