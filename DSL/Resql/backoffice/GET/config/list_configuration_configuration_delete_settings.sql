/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration entry for auth"
  method: get
  namespace: config
  allowlist:
    query: []
  response:
    fields:
      - field: key
        type: string
        description: "Key of the configuration setting"
      - field: value
        type: string
        description: "Value associated with the configuration key"
*/
SELECT
    key,
    value
FROM configuration
WHERE
    created IN (
        SELECT MAX(created)
        FROM configuration
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
