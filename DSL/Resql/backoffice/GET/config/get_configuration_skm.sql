WITH
    configuration_values AS (
        SELECT
            id,
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
            SELECT MAX(c2.created) FROM config.configuration as c2
            WHERE c2.key = c1.key
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
    MAX(CASE WHEN KEY = 'skm_semantic_configuration' THEN value END) AS semantic_configuration
FROM configuration_values;
