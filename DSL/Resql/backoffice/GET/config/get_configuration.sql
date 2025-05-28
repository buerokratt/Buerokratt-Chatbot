/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration entry for a given key"
  method: get
  namespace: config
  returns: json
  allowlist:
    query:
      - field: key
        type: string
        description: "Configuration key to retrieve"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier for the configuration entry"
      - field: key
        type: string
        description: "Key of the configuration setting"
      - field: value
        type: string
        description: "Value associated with the configuration key"
*/
SELECT
    id,
    key,
    value
FROM config.configuration AS c1
WHERE
    key = :key
    AND created = (
            SELECT MAX(c2.created) FROM config.configuration as c2
            WHERE c2.key = c1.key
    )
    AND NOT deleted;
