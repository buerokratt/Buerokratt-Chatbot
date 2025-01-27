WITH last_configuration AS (
    SELECT key, value
    FROM configuration
    WHERE key IN (
     'is_bot_active',
     'is_burokratt_active',
     'is_csa_name_visible',
     'is_csa_title_visible',
     'is_edit_chat_visible')
    AND id IN (SELECT max(id) from configuration GROUP BY key)
    AND deleted = FALSE
), new_configuration as (
  SELECT new_values.key, new_values.value, :created::timestamp with time zone as created
  FROM (
    VALUES
        ('is_bot_active', :is_bot_active),
        ('is_burokratt_active', :is_burokratt_active),
        ('is_csa_name_visible', :is_csa_name_visible),
        ('is_csa_title_visible', :is_csa_title_visible),
        ('is_edit_chat_visible', :is_edit_chat_visible)
   ) as new_values (key, value)
)
INSERT INTO configuration (key, value, created)
SELECT new_configuration.key, new_configuration.value, created from new_configuration 
JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
