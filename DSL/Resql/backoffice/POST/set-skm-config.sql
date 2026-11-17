WITH last_configuration AS (
    SELECT key, value
    FROM configuration
    WHERE key IN (
     'azure_agent_name',
     'azure_agent_type',
     'azure_agentic_max_output_tokens',
     'azure_agentic_use_structured_inputs')
    AND id IN (SELECT max(id) from configuration GROUP BY key)
    AND deleted = FALSE
), new_configuration as (
  SELECT new_values.key, new_values.value, :created::timestamp with time zone as created
  FROM (
    VALUES
        ('azure_agent_name', :azure_agent_name),
        ('azure_agent_type', :azure_agent_type),
        ('azure_agentic_max_output_tokens', :azure_agentic_max_output_tokens),
        ('azure_agentic_use_structured_inputs', :azure_agentic_use_structured_inputs)
   ) as new_values (key, value)
)
INSERT INTO configuration (key, value, created)
SELECT new_configuration.key, new_configuration.value, created from new_configuration 
JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
