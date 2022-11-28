SELECT id_code, active
FROM customer_support_agent_activity
WHERE id_code = :customerSupportId
  AND id IN (SELECT max(id) FROM customer_support_agent_activity WHERE id_code = :customerSupportId)