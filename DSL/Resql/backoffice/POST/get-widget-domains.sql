SELECT DISTINCT ON (domain_id) name, url, domain_id, active
FROM widget_domains
WHERE active = TRUE
ORDER BY domain_id, created DESC;