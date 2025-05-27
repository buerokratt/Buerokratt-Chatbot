DELETE FROM user_page_preferences
WHERE (user_id, page_name, created) NOT IN (
    SELECT user_id, page_name, max(created)
    FROM user_page_preferences
    GROUP BY user_id, page_name
) AND created < %(export_boundary)s;
