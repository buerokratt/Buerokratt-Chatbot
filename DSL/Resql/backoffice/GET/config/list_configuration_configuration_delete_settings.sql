SELECT
    key,
    value
FROM config.configuration
WHERE
    created IN (
        SELECT MAX(created)
        FROM config.configuration
        WHERE
            key IN (
                'isAuthConversations',
                'authPeriod',
                'isAnonymConversations',
                'anonymPeriod',
                'deletionTimeISO'
            )
        GROUP BY key
    )
    AND key IN (
        'isAuthConversations',
        'authPeriod',
        'isAnonymConversations',
        'anonymPeriod',
        'deletionTimeISO'
    )
ORDER BY key ASC;
