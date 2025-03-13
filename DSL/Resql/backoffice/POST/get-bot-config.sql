WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('is_bot_active', 
                  'is_burokratt_active', 
                  'is_csa_name_visible',
                  'is_csa_title_visible',
                  'is_edit_chat_visible'
                 )
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'is_bot_active' THEN value END) AS is_bot_active,
    MAX(CASE WHEN KEY = 'is_burokratt_active' THEN value END) AS is_burokratt_active,
    MAX(CASE WHEN KEY = 'is_csa_name_visible' THEN value END) AS is_csa_name_visible,
    MAX(CASE WHEN KEY = 'is_csa_title_visible' THEN value END) AS is_csa_title_visible,
    MAX(CASE WHEN KEY = 'is_edit_chat_visible' THEN value END) AS is_edit_chat_visible
FROM configuration_values;
