SELECT ARRAY_AGG(name) AS names
FROM establishment
WHERE id IN (
    SELECT MAX(id) FROM establishment
    GROUP BY base_id
) AND deleted = false
