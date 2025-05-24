SELECT ARRAY_AGG(name) AS names
FROM org.establishment AS e1
WHERE created = (
    SELECT MAX(e2.created) FROM org.establishment AS e2
    WHERE e1.base_id = e2.base_id
) AND deleted = false
