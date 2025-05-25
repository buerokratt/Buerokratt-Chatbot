/*
declaration:
  version: 0.1
  description: "Fetch user authorities/permissions by user ID code for active users"
  method: get
  namespace: auth_users
  allowlist:
    query:
      - field: userIdCode
        type: string
        description: "User's unique identifier code"
  response:
    fields:
      - field: authorities
        type: array
        items:
          type: string
          enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "User's authority/permission level"
*/
SELECT authority_name AS authorities
FROM denormalized_user_data
WHERE
    id_code = :userIdCode
    AND user_status <> 'deleted'
ORDER BY created DESC
LIMIT 1;
