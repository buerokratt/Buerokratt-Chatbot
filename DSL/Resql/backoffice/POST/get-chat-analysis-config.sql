WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('chat_analysis_enabled',
                  'chat_analysis_theme',
                  'chat_analysis_byk_response_quality',
                  'chat_analysis_follow_up_action'
                 )
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'chat_analysis_enabled' THEN value END) AS chat_analysis_enabled,
    MAX(CASE WHEN KEY = 'chat_analysis_theme' THEN value END) AS chat_analysis_theme,
    MAX(CASE WHEN KEY = 'chat_analysis_byk_response_quality' THEN value END) AS chat_analysis_byk_response_quality,
    MAX(CASE WHEN KEY = 'chat_analysis_follow_up_action' THEN value END) AS chat_analysis_follow_up_action
FROM configuration_values;
