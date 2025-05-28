/*
declaration:
  version: 0.1
  description: "Create a new user authority"
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
      - field: userStatus
        type: string
        enum: ['active', 'deleted']
        description: "User's status (will be cast to user_status enum)"
      - field: roles
        type: array
        items:
            type: string
            enum: ['ROLE_ADMINISTRATOR', 'ROLE_SERVICE_MANAGER', 'ROLE_CUSTOMER_SUPPORT_AGENT', 'ROLE_CHATBOT_TRAINER', 'ROLE_ANALYST', 'ROLE_UNAUTHENTICATED']
        description: "User's roles/authorities (will be converted to array)"
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
SELECT copy_row_with_modifications(
    'auth_users.denormalized_user_data',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
         'first_name', '', :firstName,
        'last_name', '', :lastName,
        'display_name', '', :displayName,
        'csa_title', '', :csaTitle,
        'csa_email', '', :csaEmail,
        'department', '', :department,
        'user_status', '::user_status', :userStatus,
        'authority_name', '::authority_role_type[]', (ARRAY[:roles])::VARCHAR,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
) FROM auth_users.denormalized_user_data
WHERE id_code = :userIdCode
ORDER BY created DESC
LIMIT 1;
