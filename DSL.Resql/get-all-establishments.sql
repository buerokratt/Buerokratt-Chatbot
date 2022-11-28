SELECT array_agg(name) AS names
FROM establishment
WHERE id IN (SELECT max(id) FROM establishment GROUP BY base_id) AND deleted = false