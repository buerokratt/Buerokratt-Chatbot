INSERT INTO user_page_preferences (
    user_id, page_name, page_results, selected_columns
)
VALUES (
    :user_id,
    :page_name,
    :page_results,
    :selected_columns::TEXT []
);
