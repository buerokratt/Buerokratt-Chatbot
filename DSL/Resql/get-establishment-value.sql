SELECT url
FROM establishment
WHERE name = :establishmentName AND
        id IN (SELECT max(id) FROM establishment GROUP BY base_id);