/*
declaration:
  version: 0.1
  description: "Insert or update SKM configuration parameters only if values have changed from the latest non-deleted settings"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: skm_range
        type: string
        description: "Time range or context scope for SKM query"
      - field: skm_documents
        type: string
        description: "Document sources or identifiers used in SKM context"
      - field: skm_system_message
        type: string
        description: "System prompt or context message for SKM"
      - field: skm_max_tokens
        type: string
        description: "Maximum token count for SKM response generation"
      - field: skm_index_name
        type: string
        description: "Index name used for SKM search"
      - field: skm_query_type
        type: string
        description: "Type of query (e.g., semantic, keyword) used in SKM"
      - field: skm_semantic_configuration
        type: string
        description: "Additional configuration for semantic search behavior"
*/
WITH
    last_configuration AS (
        SELECT
            key,
            value
        FROM config.configuration AS c1
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
            SELECT MAX(c2.created) FROM config.configuration AS c2
            WHERE c1.key = c2.key
        )
        AND deleted = FALSE
    ),

new_configuration AS (
        SELECT
            new_values.key,
            new_values.value
        FROM (
            VALUES
            ('skm_range', :skm_range),
            ('skm_documents', :skm_documents),
            ('skm_system_message', :skm_system_message),
            ('skm_max_tokens', :skm_max_tokens),
            ('skm_index_name', :skm_index_name),
            ('skm_query_type', :skm_query_type),
            ('skm_semantic_configuration', :skm_semantic_configuration)
        ) AS new_values (key, value)
    )

INSERT INTO config.configuration (key, value)
SELECT
    new_configuration.key,
    new_configuration.value
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
