/*
declaration:
  version: 0.1
  description: "Fetch user status by user's id_code"
  method: get
  namespace: auth_users
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
      - field: active
        type: boolean
        description: "Flag is user active"
      - field: status
        type: string
        enum: ['online', 'idle', 'offline']
        description: "User's email address"
*/
SELECT
    id_code,
    active,
    status
FROM denormalized_user_data
WHERE
    id_code = :customerSupportId
ORDER BY created DESC
LIMIT 1;
