SELECT chat_base_id as chat_id
FROM message
left join chat on message.chat_base_id = chat.base_id left join chat_history_comments on message.chat_base_id = chat_history_comments.chat_id 
WHERE lower(content) LIKE
      (SELECT lower(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')))
OR lower(chat_base_id) LIKE
      (SELECT lower(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')))      
OR lower(message.author_first_name) LIKE
      (SELECT lower(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')))
OR lower(message.author_last_name) LIKE
      (SELECT lower(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')))   
OR lower(chat_history_comments.comment) LIKE
      (SELECT lower(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')))   
GROUP BY chat_base_id;
