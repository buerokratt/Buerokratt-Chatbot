SELECT service_id, name, description, current_state AS state, updated_at
FROM (
  SELECT DISTINCT ON (service_id) service_id, name, description, current_state, updated_at
  FROM services
  WHERE NOT deleted
    AND is_common = false
  ORDER BY service_id, id DESC
) latest
ORDER BY name ASC;
