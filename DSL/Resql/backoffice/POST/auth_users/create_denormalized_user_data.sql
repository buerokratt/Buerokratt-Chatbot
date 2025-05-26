/*
declaration:
  version: 0.1
  description: "Create a new user with profile information and authorities"
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
INSERT INTO denormalized_user_data (
    login,
    id_code,
    first_name,
    last_name,
    display_name,
    user_status,
    authority_name,
    csa_title,
    csa_email,
    department
)
VALUES (
    :userIdCode,
    :userIdCode,
    :firstName,
    :lastName,
    :displayName,
    :userStatus::user_status,
    ARRAY[:roles],
    :csaTitle,
    :csaEmail,
    :department
);