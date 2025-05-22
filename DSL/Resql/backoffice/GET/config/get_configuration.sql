SELECT
    id,
    key,
    value
FROM configuration AS c1
WHERE
    key = :key
    AND created = (
            SELECT MAX(c2.created) FROM configuration as c2
            WHERE c2.key = c1.key
    )
    AND NOT deleted;
