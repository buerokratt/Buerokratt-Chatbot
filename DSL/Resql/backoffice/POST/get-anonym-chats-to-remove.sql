WITH LatestChats AS (
    SELECT DISTINCT ON (base_id) base_id, preserve, ended, status, end_user_id
    FROM chat
    ORDER BY base_id, id DESC
)
SELECT lc.base_id
FROM LatestChats lc
WHERE lc.ended IS NOT NULL
  AND lc.status = 'ENDED'
  AND (lc.end_user_id IS NULL OR lc.end_user_id = '')
  AND lc.ended < :fromDate::timestamp with time zone
  AND (lc.preserve IS NULL OR lc.preserve IS NOT TRUE)
  AND EXISTS (SELECT 1 FROM message m WHERE m.chat_base_id = lc.base_id AND m.content <> '');
