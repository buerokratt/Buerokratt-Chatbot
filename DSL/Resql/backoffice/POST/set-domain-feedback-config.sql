WITH domain_list AS (
    SELECT (jsonb_array_elements_text(:domains::jsonb))::uuid AS domain
    ),
    last_configuration AS (
SELECT DISTINCT ON (key, domain)
    key,
    value,
    domain
FROM configuration
WHERE key IN (
    'feedbackActive',
    'feedbackQuestion',
    'feedbackNoticeActive',
    'feedbackNotice'
    )
  AND deleted = FALSE
ORDER BY key, domain, created DESC
    ),
    new_configuration AS (
SELECT
    v.key,
    v.value,
    d.domain,
    :created::timestamptz AS created
FROM domain_list d
    CROSS JOIN LATERAL (
    VALUES
    ('feedbackActive', :feedbackActive),
    ('feedbackQuestion', :feedbackQuestion),
    ('feedbackNoticeActive', :feedbackNoticeActive),
    ('feedbackNotice', :feedbackNotice)
    ) AS v(key, value)
    )
INSERT INTO configuration (key, value, domain, created)
SELECT
    n.key,
    n.value,
    n.domain,
    n.created
FROM new_configuration n
         LEFT JOIN last_configuration l
                   ON l.key = n.key
                       AND l.domain = n.domain
WHERE n.value IS DISTINCT FROM l.value;
