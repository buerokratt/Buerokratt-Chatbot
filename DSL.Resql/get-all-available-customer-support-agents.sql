SELECT id_code, active, status
FROM customer_support_agent_activity
WHERE (status = 'online' OR status = 'idle')
  AND id IN (SELECT MAX(id) FROM customer_support_agent_activity GROUP BY id_code);