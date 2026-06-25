INSERT INTO user_widget_domains (user_login, domain_id)
VALUES (:userIdCode, ARRAY [ :domains ]::UUID[]);
