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
      AND "domain" = :domainUuid::UUID
      AND NOT deleted
      AND id IN (SELECT max(id) FROM configuration where "domain" = :domainUuid::UUID GROUP BY KEY)
)
SELECT
    COALESCE(MAX(CASE WHEN KEY = 'chat_analysis_enabled' THEN value END), 'true') AS chat_analysis_enabled,
    COALESCE(MAX(CASE WHEN KEY = 'chat_analysis_theme' THEN value END), '') AS chat_analysis_theme,
    COALESCE(MAX(CASE WHEN KEY = 'chat_analysis_byk_response_quality' THEN value END), '') AS chat_analysis_byk_response_quality,
    COALESCE(MAX(CASE WHEN KEY = 'chat_analysis_follow_up_action' THEN value END), '') AS chat_analysis_follow_up_action
FROM configuration_values;
