/*
declaration:
  version: 0.1
  description: "Fetch all active users with their latest profile information, ordered by ID code"
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
      - field: created
        type: timestamp
        description: "User record creation timestamp"
      - field: csa_title
        type: string
        description: "Customer Support Agent title"
      - field: first_name
        type: string
        description: "User's first name"
      - field: last_name
        type: string
        description: "User's last name"
      - field: display_name
        type: string
        description: "User's display name"
*/
SELECT DISTINCT ON (u.id_code)
    u.id_code,
    u.created,
    u.csa_title,
    u.first_name,
    u.last_name,
    u.display_name
FROM
    auth_users."user" AS u
WHERE
    u.status = 'active'
ORDER BY
    u.id_code,
    u.created DESC;