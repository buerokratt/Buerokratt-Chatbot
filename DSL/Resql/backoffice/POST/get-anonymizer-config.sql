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
                  'is_anonymization_before_global_classifier'
                 )
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'anonymizer_selected_approach' THEN value END) AS anonymizer_selected_approach,
    MAX(CASE WHEN KEY = 'anonymizer_selected_entities' THEN value END) AS anonymizer_selected_entities,
    MAX(CASE WHEN KEY = 'anonymizer_allowlist' THEN value END) AS anonymizer_allowlist,
    MAX(CASE WHEN KEY = 'anonymizer_denylist' THEN value END) AS anonymizer_denylist,
    MAX(CASE WHEN KEY = 'is_anonymization_before_llm' THEN value END) AS is_anonymization_before_llm,
    MAX(CASE WHEN KEY = 'is_anonymization_before_global_classifier' THEN value END) AS is_anonymization_before_global_classifier
FROM configuration_values;
