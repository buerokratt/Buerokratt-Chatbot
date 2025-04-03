WITH last_configuration AS (
    SELECT key, value
    FROM configuration
    WHERE key IN (
     'skm_range',
     'skm_documents',
     'skm_system_message',
     'skm_max_tokens',
     'skm_index_name',
     'skm_query_type',
     'skm_semantic_configuration')
    AND id IN (SELECT max(id) from configuration GROUP BY key)
    AND deleted = FALSE
), new_configuration as (
  SELECT new_values.key, new_values.value, :created::timestamp with time zone as created
  FROM (
    VALUES
        ('skm_range', :skm_range),
        ('skm_documents', :skm_documents),
        ('skm_system_message', :skm_system_message),
        ('skm_max_tokens', :skm_max_tokens),
        ('skm_index_name', :skm_index_name),
        ('skm_query_type', :skm_query_type),
        ('skm_semantic_configuration', :skm_semantic_configuration)
   ) as new_values (key, value)
)
INSERT INTO configuration (key, value, created)
SELECT new_configuration.key, new_configuration.value, created from new_configuration 
JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
