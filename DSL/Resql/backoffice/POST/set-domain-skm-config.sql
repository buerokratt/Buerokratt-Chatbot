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
     'azure_agent_name',
     'azure_agent_type',
     'azure_agentic_max_output_tokens',
     'azure_agentic_use_structured_inputs'
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
    now() AS created
FROM (
    VALUES
        ('azure_agent_name', :azure_agent_name),
        ('azure_agent_type', :azure_agent_type),
        ('azure_agentic_max_output_tokens', :azure_agentic_max_output_tokens),
        ('azure_agentic_use_structured_inputs', :azure_agentic_use_structured_inputs)
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
