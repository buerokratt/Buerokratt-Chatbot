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
FROM org.establishment AS e_1
WHERE created = (
    SELECT MAX(e_2.created) FROM org.establishment AS e_2
    WHERE e_1.base_id = e_2.base_id
) AND deleted = false
