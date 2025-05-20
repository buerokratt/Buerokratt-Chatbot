SELECT DISTINCT ON (u.id_code)
    u.id_code,
    u.created,
    u.csa_title,
    u.first_name,
    u.last_name,
    u.display_name
FROM
    "user" AS u
WHERE
    u.status = 'active'
ORDER BY
    u.id_code,
    u.created DESC;