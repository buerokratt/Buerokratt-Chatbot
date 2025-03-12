WITH grouped_configurations AS (
    SELECT max(id) maxId
    from configuration
    GROUP BY key
)
SELECT (CASE WHEN (time.value IS NULL OR time.deleted IS true) THEN '' ELSE time.value END)     AS time,
       (CASE WHEN (active.value = 'true' AND active.deleted IS false) THEN true ELSE false END) AS is_active
FROM (SELECT id, key, value, deleted
      FROM configuration
      WHERE key = 'estimated_waiting_time'
        AND id IN (SELECT maxId FROM grouped_configurations)
      UNION ALL
      SELECT null, null, null, null
      LIMIT 1) AS time,
     (SELECT id, key, value, deleted
      FROM configuration
      WHERE key = 'is_estimated_waiting_time_active'
        AND id IN (SELECT maxId FROM grouped_configurations)
      UNION ALL
      SELECT null, null, null, null
      LIMIT 1) AS active;
