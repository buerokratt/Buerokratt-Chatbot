/*
declaration:
  version: 0.1
  description: "get not-deleted user by id_code"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: id_code
        type: string
        description: "Unique identifier for the user"
  response:
    fields:
      - field: id_code
        type: string
        description: "User's unique identifier"
*/
SELECT id_code
FROM "user"
WHERE
    id_code = :userIdCode
    AND created = (
        SELECT MAX(created) FROM "user"
        WHERE id_code = :userIdCode
    ) 
    AND status <> 'deleted'
