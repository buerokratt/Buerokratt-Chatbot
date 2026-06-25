WITH LatestChats AS (
    SELECT DISTINCT ON (base_id) base_id, status, updated, ended
    FROM chat
    WHERE updated >= (CURRENT_DATE - INTERVAL '1 day')
      AND updated < CURRENT_DATE + INTERVAL '1 day'
    ORDER BY base_id, updated DESC
),
LatestMessageTime AS (
    SELECT 
        chat_base_id,
        MAX(updated) AS last_message_updated
    FROM message
    GROUP BY chat_base_id
),
ChatsWithDeadTime AS (
    SELECT 
        lc.base_id,
        COALESCE(lmt.last_message_updated, lc.updated) AS last_activity_time,
        COALESCE(lmt.last_message_updated, lc.updated) + 
            (COALESCE(:idleTime::integer, 5) || ' minutes')::INTERVAL +
            (COALESCE(:inactivityTime::integer, 5) || ' minutes')::INTERVAL AS dead_time
    FROM LatestChats lc
    LEFT JOIN LatestMessageTime lmt ON lc.base_id = lmt.chat_base_id
    WHERE lc.status IS NOT NULL
      AND lc.status <> 'ENDED'
      AND lc.ended IS NULL
)
SELECT array_agg(
    json_build_object(
        'base_id', base_id,
        'ended_time', dead_time
    )
) AS dead_chats
FROM ChatsWithDeadTime
WHERE CURRENT_TIMESTAMP > dead_time;
