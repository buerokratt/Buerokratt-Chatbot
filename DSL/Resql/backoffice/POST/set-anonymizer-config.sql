WITH last_configuration AS (
    SELECT key, value
    FROM configuration
    WHERE key IN (
     'anonymizer_selected_approach',
     'anonymizer_selected_entities',
     'anonymizer_allowlist',
     'anonymizer_denylist',
     'is_anonymization_before_llm',
     'is_anonymization_before_global_classifier',
     'record_conversations_anonymously')
    AND id IN (SELECT max(id) from configuration GROUP BY key)
    AND deleted = FALSE
), new_configuration as (
  SELECT new_values.key, new_values.value, :created::timestamp with time zone as created
  FROM (
    VALUES
        ('anonymizer_selected_approach', :anonymizer_selected_approach),
        ('anonymizer_selected_entities', :anonymizer_selected_entities),
        ('anonymizer_allowlist', :anonymizer_allowlist),
        ('anonymizer_denylist', :anonymizer_denylist),
        ('is_anonymization_before_llm', :is_anonymization_before_llm),
        ('is_anonymization_before_global_classifier', :is_anonymization_before_global_classifier),
        ('record_conversations_anonymously', :record_conversations_anonymously)
   ) as new_values (key, value)
)
INSERT INTO configuration (key, value, created)
SELECT new_configuration.key, new_configuration.value, created from new_configuration 
JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
