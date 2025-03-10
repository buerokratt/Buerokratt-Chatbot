SELECT DISTINCT base_id
FROM chat
WHERE ended IS NOT NULL
  AND status = 'ENDED'
  AND ended > :fromDate::timestamp with time zone;