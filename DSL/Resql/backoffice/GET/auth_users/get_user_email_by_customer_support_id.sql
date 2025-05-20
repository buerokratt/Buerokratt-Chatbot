SELECT csa_email
FROM "user"
WHERE
    id IN (
        SELECT MAX(id) FROM "user"
        GROUP BY id_code
    )
    AND status <> 'deleted'
    AND id_code = ANY(STRING_TO_ARRAY(:customerSupportIds, ','));
