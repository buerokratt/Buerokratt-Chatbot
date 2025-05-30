/*
declaration:
  version: 0.1
  description: "Fetch all users with their latest display names, ordered by ID code"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: id_code
        type: string
        description: "User's unique identifier"
      - field: display_name
        type: string
        description: "User's display name"
*/
SELECT DISTINCT ON (id_code)
    id_code,
    display_name
FROM auth_users."user"
ORDER BY id_code ASC, created DESC;
