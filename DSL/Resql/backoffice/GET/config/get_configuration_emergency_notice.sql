/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted emergency configuration entries"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
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
FROM configuration AS c_1
WHERE key IN (
    'emergencyNoticeText',
    'emergencyNoticeStartISO',
    'emergencyNoticeEndISO',
    'isEmergencyNoticeVisible'
)
AND created = (
    SELECT MAX(c_2.created) FROM configuration AS c_2
    WHERE c_2.key = c_1.key
)
AND NOT deleted;
