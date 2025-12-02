SELECT *
FROM services s
WHERE s.current_state = 'active'
  and s.deleted = false
  AND s.name LIKE '%' || :service_name || '%'
ORDER BY s.id DESC
    LIMIT 1;