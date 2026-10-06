SELECT id, key, value
FROM configuration
WHERE key IN (
    'session_length',
    'chat_active_duration',
    'show_idle_warning',
    'idle_message',
    'show_auto_close_text',
    'auto_close_text',
    'away_status_active',
    'away_status_timeout'
    )
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND NOT deleted;
