WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM config.configuration AS c1
        WHERE key IN (
            'is_bot_active',
            'is_burokratt_active',
            'is_csa_name_visible',
            'is_csa_title_visible',
            'is_edit_chat_visible'
        )
        AND created = (
            SELECT MAX(c2.created) FROM config.configuration AS c2
            WHERE c1.key = c2.key
        )
        AND NOT deleted
    )

SELECT
    MAX(CASE WHEN key = 'is_bot_active' THEN value END) AS is_bot_active,
    MAX(CASE WHEN key = 'is_burokratt_active' THEN value END) AS is_burokratt_active,
    MAX(CASE WHEN key = 'is_csa_name_visible' THEN value END) AS is_csa_name_visible,
    MAX(CASE WHEN key = 'is_csa_title_visible' THEN value END) AS is_csa_title_visible,
    MAX(CASE WHEN key = 'is_edit_chat_visible' THEN value END) AS is_edit_chat_visible
FROM configuration_values;
