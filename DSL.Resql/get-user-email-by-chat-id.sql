SELECT u.csa_email
FROM "user" u
         INNER JOIN (SELECT customer_support_id, base_id
                     FROM chat AS c
                     WHERE c.base_id = :chatId) c ON u.id_code = c.customer_support_id
