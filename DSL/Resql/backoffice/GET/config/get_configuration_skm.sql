/*
declaration:
  version: 0.1
  description: "Fetch the latest SKM configuration values"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: range
        type: string
        description: "Range setting for SKM retrieval"
      - field: documents
        type: string
        description: "Document source or filter for SKM"
      - field: system_message
        type: string
        description: "System message used in SKM context"
      - field: max_tokens
        type: string
        description: "Maximum token limit for SKM responses"
      - field: index_name
        type: string
        description: "Index name used for SKM retrieval"
      - field: query_type
        type: string
        description: "Query type for SKM (e.g., keyword, semantic)"
      - field: semantic_configuration
        type: string
        description: "Semantic configuration parameters for SKM"
*/
WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM configuration AS c_1
        WHERE key IN (
            'skm_range',
            'skm_documents',
            'skm_system_message',
            'skm_max_tokens',
            'skm_index_name',
            'skm_query_type',
            'skm_semantic_configuration'
        )
        AND created = (
            SELECT MAX(c_2.created) FROM configuration AS c_2
            WHERE c_2.key = c_1.key
        )
        AND NOT deleted
    )

SELECT
    MAX(CASE WHEN key = 'skm_range' THEN value END) AS range,
    MAX(CASE WHEN key = 'skm_documents' THEN value END) AS documents,
    MAX(CASE WHEN key = 'skm_system_message' THEN value END) AS system_message,
    MAX(CASE WHEN key = 'skm_max_tokens' THEN value END) AS max_tokens,
    MAX(CASE WHEN key = 'skm_index_name' THEN value END) AS index_name,
    MAX(CASE WHEN key = 'skm_query_type' THEN value END) AS query_type,
    MAX(
        CASE WHEN key = 'skm_semantic_configuration' THEN value END
    ) AS semantic_configuration
FROM configuration_values;
