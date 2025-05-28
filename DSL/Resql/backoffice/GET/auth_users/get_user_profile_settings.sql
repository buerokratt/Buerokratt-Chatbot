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
SELECT
    id_code AS user_id,
    forwarded_chat_popup_notifications,
    forwarded_chat_sound_notifications,
    forwarded_chat_email_notifications,
    new_chat_popup_notifications,
    new_chat_sound_notifications,
    new_chat_email_notifications,
    use_autocorrect
FROM auth_users.denormalized_user_data
WHERE id_code = :userId
ORDER BY created DESC
LIMIT 1;
