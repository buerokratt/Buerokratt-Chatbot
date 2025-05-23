SELECT id, key, value
FROM configuration
WHERE key IN (
    'session_length',
    'chat_active_duration')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND NOT deleted;
