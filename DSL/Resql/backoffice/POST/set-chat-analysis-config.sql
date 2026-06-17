WITH last_configuration AS (
    SELECT key, value
    FROM configuration
    WHERE key IN (
     'chat_analysis_enabled',
     'chat_analysis_theme',
     'chat_analysis_byk_response_quality',
     'chat_analysis_follow_up_action')
    AND id IN (SELECT max(id) from configuration GROUP BY key)
    AND deleted = FALSE
), new_configuration as (
  SELECT new_values.key, new_values.value, NOW() as created
  FROM (
    VALUES
        ('chat_analysis_enabled', :chat_analysis_enabled),
        ('chat_analysis_theme', :chat_analysis_theme),
        ('chat_analysis_byk_response_quality', :chat_analysis_byk_response_quality),
        ('chat_analysis_follow_up_action', :chat_analysis_follow_up_action)
   ) as new_values (key, value)
)
INSERT INTO configuration (key, value, created)
SELECT new_configuration.key, new_configuration.value, created from new_configuration
JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
