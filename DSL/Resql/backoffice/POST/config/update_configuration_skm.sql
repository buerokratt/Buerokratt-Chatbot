WITH
    last_configuration AS (
        SELECT
            key,
            value
        FROM configuration AS c1
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
            SELECT MAX(c2.created) FROM configuration AS c2
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

INSERT INTO configuration (key, value)
SELECT
    new_configuration.key,
    new_configuration.value
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
