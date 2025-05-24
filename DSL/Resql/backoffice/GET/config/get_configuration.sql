SELECT
    id,
    key,
    value
FROM config.configuration AS c1
WHERE
    key = :key
    AND created = (
            SELECT MAX(c2.created) FROM config.configuration as c2
            WHERE c2.key = c1.key
    )
    AND NOT deleted;
