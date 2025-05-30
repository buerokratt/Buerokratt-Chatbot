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
FROM config.configuration AS c_1
WHERE
    key = :key
    AND created = (
        SELECT MAX(c_2.created) FROM config.configuration AS c_2
        WHERE c_2.key = c_1.key
    )
    AND NOT deleted;
