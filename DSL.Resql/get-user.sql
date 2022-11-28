SELECT id_code
FROM "user"
WHERE id_code = :userIdCode
  AND status <> 'deleted'
  AND id IN (SELECT max(id) FROM "user" WHERE id_code = :userIdCode)