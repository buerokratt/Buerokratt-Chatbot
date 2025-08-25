INSERT INTO user_authority (user_id, authority_name, created)
VALUES (:userIdCode, ARRAY [ :roles ], :created::timestamp with time zone);

INSERT INTO user_widget_domains (user_login, domain_id)
VALUES (:userIdCode, ARRAY [ :domains ]::UUID[]);
