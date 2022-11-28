SELECT chat_base_id as chat_id
FROM message
WHERE lower(content) LIKE
      (SELECT lower(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')))
GROUP BY chat_base_id;