/*
declaration:
  version: 0.1
  description: "Save or update user-specific page preferences such as results per page and selected columns"
  method: post
  accepts: json
  returns: json
  namespace: auth_users
  allowlist:
    body:
      - field: user_id
        type: string
        description: "Unique identifier of the user"
      - field: page_name
        type: string
        description: "The name of the page where preferences are applied"
      - field: page_results
        type: integer
        description: "Number of results to display per page"
      - field: selected_columns
        type: array
        items:
          type: string
        description: "List of column names selected by the user to be visible on the page"
*/
INSERT INTO user_page_preferences (
    user_id, page_name, page_results, selected_columns
)
VALUES (
    :user_id,
    :page_name,
    :page_results,
    :selected_columns::TEXT []
);
