SELECT SUM(chat_seconds) as chat_seconds
FROM (SELECT (SELECT (FLOOR(EXTRACT(EPOCH FROM
                                    (SELECT author_timestamp
                                     FROM message
                                     WHERE id IN (SELECT min(id)
                                                  FROM message
                                                  WHERE chat_base_id = c.base_id AND author_role = 'backoffice-user'))
                                        - (SELECT author_timestamp
                                           FROM message
                                           WHERE id IN (SELECT max(id)
                                                        FROM message
                                                        WHERE chat_base_id = c.base_id
                                                          AND author_role = 'buerokratt')))))) as chat_seconds
      FROM chat c
      WHERE id IN (SELECT MAX(id)
                   FROM chat
                   WHERE ended IS NOT NULL
                     AND (now() - :interval::interval) < ended
                   GROUP BY base_id)) as all_chat_values;