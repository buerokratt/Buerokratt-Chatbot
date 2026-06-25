SELECT domain_id
FROM (
         SELECT DISTINCT ON (domain_id)
             domain_id,
             active,
             url
         FROM widget_domains
         WHERE url LIKE :domainUrl
         ORDER BY domain_id, created DESC, id DESC
     ) t
WHERE active = true;