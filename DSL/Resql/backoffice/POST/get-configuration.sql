SELECT id, key, value
FROM configuration
WHERE key = :key
  AND NOT deleted
  AND (
    :domain IS NULL
    OR "domain" = :domain::UUID
  )
  AND id IN (
    SELECT max(id)
    FROM configuration
    WHERE (
      :domain IS NULL
      OR "domain" = :domain::UUID
    )
    GROUP BY key
  );
