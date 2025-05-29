/*
declaration:
  version: 0.1
  description: "Fetch active user emails by users' id_code"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: customerSupportIds
        type: string
        description: "Comma-separated list of User ids to filter by (in array format)"
  response:
    fields:
      - field: csa_email
        type: string
        description: "User's email"
*/
SELECT csa_email
FROM "user" AS u_1
WHERE
    id_code = ANY(STRING_TO_ARRAY(:customerSupportIds, ','))
    AND created = (
        SELECT MAX(u_2.created) FROM "user" AS u_2
        WHERE u_1.id_code = u_2.id_code
    )
    AND status <> 'deleted'
