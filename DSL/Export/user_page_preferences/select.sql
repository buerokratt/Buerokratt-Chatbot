COPY (
    SELECT *
    FROM user_page_preferences
    WHERE (user_id, page_name, created) NOT IN (
        SELECT user_id, page_name, max(created)
        FROM user_page_preferences
        GROUP BY user_id, page_name
    ) AND created < CURRENT_DATE - INTERVAL '1 day'
) TO stdout WITH csv HEADER;
