SELECT DISTINCT ON (user_login)
    user_login,
    domain_id AS domains,
    selected_domains as selected
FROM user_widget_domains
WHERE user_login = :user_login
ORDER BY user_login, created DESC