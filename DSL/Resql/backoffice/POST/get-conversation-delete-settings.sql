SELECT key, value
FROM configuration
WHERE created IN (
    SELECT MAX(created)
    FROM configuration
    WHERE key IN ('isAuthConversations', 'authPeriod', 'isAnonymConversations', 'anonymPeriod', 'deletionTimeISO')
    GROUP BY key
    )
  AND key IN ('isAuthConversations', 'authPeriod', 'isAnonymConversations', 'anonymPeriod', 'deletionTimeISO')
ORDER BY key;