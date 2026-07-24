SELECT current_state
FROM services
WHERE service_id = :serviceId
  AND NOT deleted
ORDER BY id DESC
LIMIT 1;
