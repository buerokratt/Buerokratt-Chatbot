SELECT DISTINCT ON (domain_id) domain_id
FROM widget_domains
WHERE active = true
  and url like :domainUrl
ORDER BY domain_id, created DESC;