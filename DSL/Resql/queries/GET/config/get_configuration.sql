SELECT id, key, value
FROM configuration
WHERE key=:key
AND id IN (SELECT max(id) from configuration GROUP BY key)
AND NOT deleted;
