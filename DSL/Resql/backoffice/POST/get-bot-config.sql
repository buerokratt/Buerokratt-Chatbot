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
                  'sub_title',
                  'response_waiting_time',
                  'response_processing_notice',
                  'llm_module_active'
                 )
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    COALESCE(MAX(CASE WHEN KEY = 'is_bot_active' THEN value END), 'false') AS is_bot_active,
    COALESCE(MAX(CASE WHEN KEY = 'is_burokratt_active' THEN value END), 'false') AS is_burokratt_active,
    COALESCE(MAX(CASE WHEN KEY = 'is_csa_name_visible' THEN value END), 'false') AS is_csa_name_visible,
    COALESCE(MAX(CASE WHEN KEY = 'is_csa_title_visible' THEN value END), 'false') AS is_csa_title_visible,
    COALESCE(MAX(CASE WHEN KEY = 'is_edit_chat_visible' THEN value END), 'false') AS is_edit_chat_visible,
    COALESCE(MAX(CASE WHEN KEY = 'instantly_open_chat_widget' THEN value END), 'false') AS instantly_open_chat_widget,
    COALESCE(MAX(CASE WHEN KEY = 'show_sub_title' THEN value END), 'false') AS show_sub_title,
    COALESCE(MAX(CASE WHEN KEY = 'sub_title' THEN value END), '') AS sub_title,
    COALESCE(MAX(CASE WHEN KEY = 'response_waiting_time' THEN value END), '10') AS response_waiting_time,
    COALESCE(MAX(CASE WHEN KEY = 'response_processing_notice' THEN value END), '') AS response_processing_notice,
    COALESCE(MAX(CASE WHEN KEY = 'llm_module_active' THEN value END), 'false') AS llm_module_active
FROM configuration_values;
