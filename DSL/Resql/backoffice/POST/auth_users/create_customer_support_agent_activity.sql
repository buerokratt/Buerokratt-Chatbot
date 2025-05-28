/*
declaration:
  version: 0.1
  description: "Update status and status comment of user by id code"
  method: post
  accepts: json
  returns: json
  namespace: auth_users
  allowlist:
    body:
      - field: status
        type: string
        enum: ['online', 'idle', 'offline']
        description: "Body field 'status'"
      - field: statusComment
        type: string
        description: "Body field 'statusComment'"
      - field: active
        type: boolean
        description: "Body field 'active'"
      - field: userIdCode
        type: string
        description: "User id code"
*/
SELECT copy_row_with_modifications(
    'auth_users.denormalized_user_data',
   'id', '::UUID', id::VARCHAR,
    ARRAY[
        'status', '::status', :status,
        'status_comment', '', :statusComment,
        'csa_created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR,
        'active', '::BOOL', :active::VARCHAR,
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)
FROM auth_users.denormalized_user_data
WHERE id_code = :userIdCode
ORDER BY created DESC
LIMIT 1;
