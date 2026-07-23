WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('skm_range', 
                  'skm_documents', 
                  'skm_system_message',
                  'skm_max_tokens',
                  'skm_index_name',
                  'skm_query_type',
                  'skm_semantic_configuration',
                  'skm_in_scope',
                  'skm_use_agentic',
                  'azure_agent_name',
                  'azure_agent_type',
                  'azure_client_id',
                  'azure_agentic_max_output_tokens',
                  'azure_client_secret_is_set')
      AND "domain" = :domainUUID::UUID
      AND id IN (SELECT max(id) FROM configuration where "domain" = :domainUUID::UUID GROUP BY KEY)
      AND NOT deleted
)
SELECT
    COALESCE(MAX(CASE WHEN KEY = 'skm_range' THEN value END), '') AS range,
    COALESCE(MAX(CASE WHEN KEY = 'skm_documents' THEN value END), '') AS documents,
    COALESCE(MAX(CASE WHEN KEY = 'skm_system_message' THEN value END), '') AS system_message,
    COALESCE(MAX(CASE WHEN KEY = 'skm_max_tokens' THEN value END), '') AS max_tokens,
    COALESCE(MAX(CASE WHEN KEY = 'skm_index_name' THEN value END), '') AS index_name,
    COALESCE(MAX(CASE WHEN KEY = 'skm_query_type' THEN value END), '') AS query_type,
    COALESCE(MAX(CASE WHEN KEY = 'skm_semantic_configuration' THEN value END), '') AS semantic_configuration,
    COALESCE(MAX(CASE WHEN KEY = 'skm_in_scope' THEN value END), 'true') AS in_scope,
    COALESCE(MAX(CASE WHEN KEY = 'skm_use_agentic' THEN value END), 'false') AS use_agentic,
    COALESCE(MAX(CASE WHEN KEY = 'azure_agent_name' THEN value END), '') AS azure_agent_name,
    COALESCE(MAX(CASE WHEN KEY = 'azure_agent_type' THEN value END), '') AS azure_agent_type,
    COALESCE(MAX(CASE WHEN KEY = 'azure_client_id' THEN value END), '') AS azure_client_id,
    COALESCE(MAX(CASE WHEN KEY = 'azure_agentic_max_output_tokens' THEN value END), '4000') AS azure_agentic_max_output_tokens,
    COALESCE(MAX(CASE WHEN KEY = 'azure_client_secret_is_set' THEN value END), 'false') AS azure_client_secret_is_set
FROM configuration_values;
