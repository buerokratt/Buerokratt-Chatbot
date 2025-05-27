SELECT id, user_id, page_name, page_results, created, selected_columns
FROM user_page_preferences
WHERE
    user_id = :user_id
    AND page_name = :page_name
ORDER BY created DESC LIMIT 1;
