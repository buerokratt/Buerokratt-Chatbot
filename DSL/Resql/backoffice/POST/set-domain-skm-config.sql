WITH
    domain_list AS (
        SELECT (jsonb_array_elements_text(:domains::jsonb))::uuid AS domain
    ),

    last_configuration AS (
SELECT
    c.domain,
    c.key,
    c.value
FROM configuration AS c
    JOIN domain_list AS d
ON c.domain = d.domain
WHERE
    c.key IN (
     'skm_range',
     'skm_documents',
     'skm_system_message',
     'skm_max_tokens',
     'skm_index_name',
     'skm_query_type',
     'skm_semantic_configuration',
     'skm_in_scope'
    )
  AND c.deleted = FALSE
  AND c.id = (
    SELECT MAX(id)
    FROM configuration AS c2
    WHERE
    c2.domain = c.domain
  AND c2.key    = c.key
    )
    ),

    new_configuration AS (
SELECT
    v.key,
    v.value,
    :created::timestamptz AS created
FROM (
    VALUES
        ('skm_range', :skm_range),
        ('skm_documents', :skm_documents),
        ('skm_system_message', :skm_system_message),
        ('skm_max_tokens', :skm_max_tokens),
        ('skm_index_name', :skm_index_name),
        ('skm_query_type', :skm_query_type),
        ('skm_semantic_configuration', :skm_semantic_configuration),
        ('skm_in_scope', :skm_in_scope)
   ) AS v(key, value)
    )
INSERT INTO configuration (key, value, domain, created)
SELECT
    nc.key,
    nc.value,
    dl.domain,
    nc.created
FROM new_configuration AS nc
         CROSS JOIN domain_list      AS dl
         LEFT JOIN last_configuration AS lc
                   ON lc.domain = dl.domain
                       AND lc.key    = nc.key
WHERE
    nc.value IS DISTINCT FROM lc.value
    RETURNING key, value, domain;
