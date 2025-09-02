INSERT INTO user_widget_domains (user_login, domain_id, selected_domains)
VALUES (:userId, ARRAY [ :domains ]::UUID[],ARRAY [ :selected ]::UUID[]);