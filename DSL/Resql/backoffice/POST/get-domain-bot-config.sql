WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('is_bot_active',
                  'is_burokratt_active',
                  'is_csa_name_visible',
                  'is_csa_title_visible',
                  'is_edit_chat_visible',
                  'instantly_open_chat_widget',
                  'show_sub_title',
                  'sub_title'
                 )
      AND "domain" = :domainUUID::UUID
      AND NOT deleted
      AND id IN (SELECT max(id) FROM configuration where "domain" = :domainUUID::UUID GROUP BY KEY)
)
SELECT
    MAX(CASE WHEN KEY = 'is_bot_active' THEN value END) AS is_bot_active,
    MAX(CASE WHEN KEY = 'is_burokratt_active' THEN value END) AS is_burokratt_active,
    MAX(CASE WHEN KEY = 'is_csa_name_visible' THEN value END) AS is_csa_name_visible,
    MAX(CASE WHEN KEY = 'is_csa_title_visible' THEN value END) AS is_csa_title_visible,
    MAX(CASE WHEN KEY = 'is_edit_chat_visible' THEN value END) AS is_edit_chat_visible,
    MAX(CASE WHEN KEY = 'instantly_open_chat_widget' THEN value END) AS instantly_open_chat_widget,
    MAX(CASE WHEN KEY = 'show_sub_title' THEN value END) AS show_sub_title,
    MAX(CASE WHEN KEY = 'sub_title' THEN value END) AS sub_title
FROM configuration_values;
