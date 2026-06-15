SELECT *
FROM chat AS c
WHERE c.base_id = :chatBaseId
ORDER BY c.created DESC
LIMIT 1;
