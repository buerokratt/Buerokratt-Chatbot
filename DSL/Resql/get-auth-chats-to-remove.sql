SELECT DISTINCT base_id
FROM chat
WHERE ended IS NOT NULL
  AND status = 'ENDED'
  AND end_user_id IS NOT NULL
  AND ended > :fromDate::timestamp with time zone;