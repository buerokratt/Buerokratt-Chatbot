SELECT *
FROM service
WHERE status = 'approved'
  AND service_id = :service_id
ORDER BY id DESC
    LIMIT 1;
