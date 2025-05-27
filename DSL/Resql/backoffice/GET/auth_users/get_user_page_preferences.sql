/*
declaration:
  version: 0.1
  description: "Fetch user's page preferences by user_id and page name"
  method: get
  namespace: auth_users
  returns: json
  allowlist:
    query:
      - field: user_id
        type: string
        description: "Unique identifier for the user"
      - field: page_name
        type: string
        description: "Page name"
  response:
    fields:
      - field: id
        type: string
        description: "preference id"
      - field: user_id
        type: string
        description: "User's unique identifier"
      - field: page_name
        type: string
        description: "Page name"
      - field: page_results
        type: string
        description: "Page results"
      - field: created
        type: timestamp
        description: "Creation timestamp"
*/
SELECT id, user_id, page_name, page_results, created
FROM user_page_preferences
WHERE
    user_id = :user_id
    AND page_name = :page_name
ORDER BY created DESC LIMIT 1;
