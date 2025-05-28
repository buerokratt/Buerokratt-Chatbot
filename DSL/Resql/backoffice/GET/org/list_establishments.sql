/*
declaration:
  version: 0.1
  description: "Fetch array of all active establishment names"
  method: get
  namespace: org
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: names
        type: array
        items:
          type: string
        description: "Array of establishment names"
*/
SELECT ARRAY_AGG(name) AS names
FROM org.establishment AS e1
WHERE created = (
    SELECT MAX(e2.created) FROM org.establishment AS e2
    WHERE e1.base_id = e2.base_id
) AND deleted = false
