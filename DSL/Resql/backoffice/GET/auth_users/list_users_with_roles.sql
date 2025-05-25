/*
declaration:
  version: 0.1
  description: "Fetch all active users with authorities and their latest profile information with optional CSA title visibility"
  method: get
  namespace: auth_users
  allowlist:
    query:
      - field: is_csa_title_visible
        type: string
        enum: ['true', 'false']
        description: "Flag to control CSA title visibility"
  response:
    fields:
      - field: login
        type: string
        description: "User's login identifier"
      - field: first_name
        type: string
        description: "User's first name"
      - field: last_name
        type: string
        description: "User's last name"
      - field: id_code
        type: string
        description: "User's unique identifier"
      - field: display_name
        type: string
        description: "User's display name"
      - field: csa_title
        type: string
        description: "Customer Support Agent title (conditionally visible)"
      - field: csa_email
        type: string
        description: "Customer Support Agent email address"
      - field: authorities
        type: array
        items:
          type: string
          enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "User's authority/permission level"
*/
SELECT
    login,
    first_name,
    last_name,
    id_code,
    display_name,
    CASE
        WHEN :is_csa_title_visible = 'true' THEN csa_title
        ELSE ''
    END AS csa_title,
    csa_email,
    authority_name AS authorities
FROM denormalized_user_data AS d_1
WHERE
    user_status <> 'deleted'
    AND ARRAY_LENGTH(authority_name, 1) > 0
    AND created = (
        SELECT MAX(d_2.created) FROM denormalized_user_data AS d_2
        WHERE d_1.id_code = d_2.id_code
    );
