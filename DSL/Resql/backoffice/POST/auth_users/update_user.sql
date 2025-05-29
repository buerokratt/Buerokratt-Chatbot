/*
declaration:
  version: 0.1
  description: "Update a user"
  method: post
  accepts: json
  returns: json
  namespace: auth_users
  allowlist:
    body:
      - field: userIdCode
        type: string
        description: "User's unique identifier code (used for both login and id_code)"
      - field: firstName
        type: string
        description: "User's first name"
      - field: lastName
        type: string
        description: "User's last name"
      - field: displayName
        type: string
        description: "User's display name"
      - field: status
        type: string
        enum: ['active', 'deleted']
        description: "User's status (will be cast to user_status enum)"
      - field: csaTitle
        type: string
        description: "Customer Support Agent title"
      - field: csaEmail
        type: string
        description: "Customer Support Agent email address"
      - field: department
        type: string
        description: "User's department"
*/
SELECT COPY_ROW_WITH_MODIFICATIONS(
    'auth_users.user',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'first_name', '', :firstName,
        'last_name', '', :lastName,
        'display_name', '', :displayName,
        'status', '::USER_STATUS', :status,
        'csa_title', '', :csaTitle,
        'csa_email', '', :csaEmail,
        'department', '', :department,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR []
) FROM "user"
WHERE created = (
    SELECT MAX(created) FROM "user"
    WHERE id_code = :userIdCode
);
