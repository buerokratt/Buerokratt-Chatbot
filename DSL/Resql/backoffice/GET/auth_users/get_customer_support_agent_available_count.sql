/*
declaration:
  version: 0.1
  description: "Fetch amount of available users "
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: count
        type: integer
        description: "Amount of online users"
*/
SELECT COUNT(id) AS count
FROM auth_users.denormalized_user_data AS d_1
WHERE
    (status = 'online' OR status = 'idle')
    AND created = (
        SELECT MAX(d_1.created) FROM auth_users.denormalized_user_data AS d_2
        where d_1.id_code = d_2.id_code
    );
