SELECT *
FROM services s
WHERE s.current_state = 'active'
  AND s.deleted = false
  AND s.name = :service_name
ORDER BY s.id DESC
LIMIT 1;
