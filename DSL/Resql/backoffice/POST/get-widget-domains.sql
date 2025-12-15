SELECT name,
       url,
       domain_id,
       active
FROM (
         SELECT DISTINCT ON (domain_id)
             name,
             url,
             domain_id,
             active
         FROM widget_domains
         ORDER BY
             domain_id,
             created DESC,
             id DESC
     ) AS latest_per_domain
WHERE active = TRUE;