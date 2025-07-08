SELECT id
FROM "user"
WHERE id_code = :userIdCode
  AND status <> 'deleted'
  AND id IN (SELECT MAX(id) FROM "user" WHERE id_code = :userIdCode)