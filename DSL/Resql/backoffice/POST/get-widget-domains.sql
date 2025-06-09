SELECT DISTINCT ON (name) name, url
FROM widget_domains
WHERE active = TRUE
ORDER BY name, created DESC;