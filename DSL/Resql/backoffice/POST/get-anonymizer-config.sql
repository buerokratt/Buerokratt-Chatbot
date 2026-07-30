WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('anonymizer_selected_approach', 
                  'anonymizer_selected_entities', 
                  'anonymizer_allowlist',
                  'anonymizer_denylist',
                  'is_anonymization_before_llm',
                  'is_anonymization_before_global_classifier',
                  'record_conversations_anonymously'
                 )
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    COALESCE(MAX(CASE WHEN KEY = 'anonymizer_selected_approach' THEN value END), '') AS anonymizer_selected_approach,
    COALESCE(MAX(CASE WHEN KEY = 'anonymizer_selected_entities' THEN value END), '') AS anonymizer_selected_entities,
    COALESCE(MAX(CASE WHEN KEY = 'anonymizer_allowlist' THEN value END), '') AS anonymizer_allowlist,
    COALESCE(MAX(CASE WHEN KEY = 'anonymizer_denylist' THEN value END), '') AS anonymizer_denylist,
    COALESCE(MAX(CASE WHEN KEY = 'is_anonymization_before_llm' THEN value END), 'false') AS is_anonymization_before_llm,
    COALESCE(MAX(CASE WHEN KEY = 'is_anonymization_before_global_classifier' THEN value END), 'false') AS is_anonymization_before_global_classifier,
    COALESCE(MAX(CASE WHEN KEY = 'record_conversations_anonymously' THEN value END), 'false') AS record_conversations_anonymously
FROM configuration_values;
