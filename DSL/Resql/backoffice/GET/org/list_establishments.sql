SELECT ARRAY_AGG(name) AS names
FROM establishment AS e1
WHERE created = (
    SELECT MAX(e2.created) FROM establishment AS e2
    WHERE e1.base_id = e2.base_id
) AND deleted = false
