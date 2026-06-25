WITH LatestChats AS (
    SELECT DISTINCT ON (base_id) base_id, preserve, ended, status, end_user_id
    FROM chat
    ORDER BY base_id, id DESC
),
NonDeletedChats AS (
    SELECT DISTINCT chat_base_id
    FROM message
    WHERE content <> ''
)
SELECT lc.base_id
FROM LatestChats lc
JOIN NonDeletedChats nd ON nd.chat_base_id = lc.base_id
WHERE lc.ended IS NOT NULL
  AND lc.status = 'ENDED'
  AND (lc.end_user_id IS NULL OR lc.end_user_id = '')
  AND lc.ended < :fromDate::timestamp with time zone
  AND (lc.preserve IS NULL OR lc.preserve IS NOT TRUE);
