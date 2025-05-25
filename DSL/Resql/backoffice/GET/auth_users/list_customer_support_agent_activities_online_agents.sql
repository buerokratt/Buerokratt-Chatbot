/*
declaration:
  version: 0.1
  description: "Fetch all currently online users with their latest status information"
  method: get
  namespace: auth_users
  response:
    fields:
      - field: id_code
        type: string
        description: "User's unique identifier"
      - field: active
        type: boolean
        description: "Flag indicating if user is active"
      - field: status
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "User's current status"
      - field: status_comment
        type: string
        description: "Additional comment about user's status"
*/
SELECT
    id_code,
    active,
    status,
    status_comment
FROM denormalized_user_data as d_1
WHERE
    (status = 'online')
    AND created IN (
        SELECT MAX(d_2.created) FROM denormalized_user_data as d_2
        WHERE d_1.id_code = d2.id_code
    );
