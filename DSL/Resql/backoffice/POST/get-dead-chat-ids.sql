WITH MaxChats AS (
    SELECT MAX(id) AS maxId
    FROM chat
    GROUP BY base_id
),
OpenChats AS (
    SELECT c.base_id, c.updated
    FROM chat c
    JOIN MaxChats mc ON c.id = mc.maxId
    WHERE c.status IS NOT NULL
      AND c.status <> 'ENDED'
      AND c.ended IS NULL
),
LatestMessageTime AS (
    SELECT
        m.chat_base_id,
        MAX(m.updated) AS last_message_updated
    FROM message m
    JOIN OpenChats oc ON m.chat_base_id = oc.base_id
    GROUP BY m.chat_base_id
),
ChatsWithDeadTime AS (
    SELECT
        oc.base_id,
        COALESCE(lmt.last_message_updated, oc.updated) AS last_activity_time,
        COALESCE(lmt.last_message_updated, oc.updated) +
            (COALESCE(:idleTime::integer, 5) || ' minutes')::INTERVAL +
            (COALESCE(:inactivityTime::integer, 5) || ' minutes')::INTERVAL AS dead_time
    FROM OpenChats oc
    LEFT JOIN LatestMessageTime lmt ON oc.base_id = lmt.chat_base_id
)
SELECT array_agg(
    json_build_object(
        'base_id', base_id,
        'ended_time', dead_time
    )
) AS dead_chats
FROM ChatsWithDeadTime
WHERE CURRENT_TIMESTAMP > dead_time;
