SELECT id, intent, service, service_name, status, author_role, created
FROM service_trigger
WHERE intent = :intent
  AND status = 'approved'
ORDER BY created DESC
LIMIT 1
