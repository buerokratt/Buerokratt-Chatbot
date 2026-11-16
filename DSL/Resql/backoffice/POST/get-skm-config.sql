WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('azure_agent_name',
                  'azure_agent_type',
                  'azure_agentic_max_output_tokens',
                  'azure_agentic_use_structured_inputs',
                  'azure_client_id_is_set',
                  'azure_client_secret_is_set')
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    COALESCE(MAX(CASE WHEN KEY = 'azure_agent_name' THEN value END), '') AS azure_agent_name,
    COALESCE(MAX(CASE WHEN KEY = 'azure_agent_type' THEN value END), '') AS azure_agent_type,
    COALESCE(MAX(CASE WHEN KEY = 'azure_agentic_max_output_tokens' THEN value END), '4000') AS azure_agentic_max_output_tokens,
    COALESCE(MAX(CASE WHEN KEY = 'azure_agentic_use_structured_inputs' THEN value END), 'false') AS azure_agentic_use_structured_inputs,
    COALESCE(MAX(CASE WHEN KEY = 'azure_client_id_is_set' THEN value END), 'false') AS azure_client_id_is_set,
    COALESCE(MAX(CASE WHEN KEY = 'azure_client_secret_is_set' THEN value END), 'false') AS azure_client_secret_is_set
FROM configuration_values;
