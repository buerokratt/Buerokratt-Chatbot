INSERT INTO user_page_preferences (user_id, page_name, page_results,created)
VALUES (:user_id, :page_name, :page_results,:created::timestamp with time zone);