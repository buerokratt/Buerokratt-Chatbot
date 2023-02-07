SELECT u.id_code
FROM "user" u
         INNER JOIN customer_support_agent_activity csaa on u.id_code = csaa.id_code
WHERE u.id_code = :userIdCode
  AND u.status <> 'deleted'
  AND u.id IN (SELECT MAX(id) FROM "user" WHERE id_code = :userIdCode)
  AND csaa.status = ANY(:statuses::status[])
  AND csaa.id IN (SELECT MAX(id) FROM customer_support_agent_activity WHERE id_code = :userIdCode);
