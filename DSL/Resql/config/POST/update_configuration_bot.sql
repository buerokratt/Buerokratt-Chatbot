WITH
    last_configuration AS (
        SELECT
            key,
            value
        FROM configuration
        WHERE key IN (
            'is_bot_active',
            'is_burokratt_active',
            'is_csa_name_visible',
            'is_csa_title_visible',
            'is_edit_chat_visible'
        )
        AND id IN (
            SELECT MAX(id) FROM configuration
            GROUP BY key
        )
        AND deleted = FALSE
    ),

new_configuration AS (
        SELECT
            new_values.key,
            new_values.value
        FROM (
            VALUES
            ('is_bot_active', :is_bot_active),
            ('is_burokratt_active', :is_burokratt_active),
            ('is_csa_name_visible', :is_csa_name_visible),
            ('is_csa_title_visible', :is_csa_title_visible),
            ('is_edit_chat_visible', :is_edit_chat_visible)
        ) AS new_values (key, value)
    )

INSERT INTO configuration (key, value)
SELECT
    new_configuration.key,
    new_configuration.value
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
