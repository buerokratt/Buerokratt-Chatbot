WITH grouped_configurations AS (
    SELECT max(id) maxId
    from configuration
    GROUP BY key
)
SELECT (CASE WHEN (est.value IS NULL OR est.deleted IS true) THEN '' ELSE est.value END)        AS est,
       (CASE WHEN (active.value = 'true' AND active.deleted IS false) THEN true ELSE false END) AS is_active
FROM (SELECT id, key, value, deleted
      FROM configuration
      WHERE key = 'greeting_message_est'
        AND id IN (SELECT maxId FROM grouped_configurations)
      UNION ALL
      SELECT null, null, null, null
      LIMIT 1) AS est,
     (SELECT id, key, value, deleted
      FROM configuration
      WHERE key = 'is_greeting_message_active'
        AND id IN (SELECT maxId FROM grouped_configurations)
      UNION ALL
      SELECT null, null, null, null
      LIMIT 1) AS active;
