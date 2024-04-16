WITH X AS (
  SELECT LOWER(regexp_replace(regexp_replace(:searchKey, E' ', E'%', 'g'), E'(.*)', E'%\\1%', 'g')) AS regex
)
SELECT chat_base_id as chat_id
FROM message
LEFT JOIN chat on message.chat_base_id = chat.base_id
LEFT JOIN chat_history_comments on message.chat_base_id = chat_history_comments.chat_id 
WHERE
   LOWER(content) LIKE (SELECT regex FROM X)
OR LOWER(chat_base_id) LIKE (SELECT regex FROM X)
OR LOWER(chat.customer_support_display_name) LIKE (SELECT regex FROM X)
OR LOWER(chat.end_user_first_name) LIKE (SELECT regex FROM X)
OR LOWER(chat.end_user_last_name) LIKE (SELECT regex FROM X)
OR LOWER(chat.end_user_id) LIKE (SELECT regex FROM X)
OR LOWER(chat.end_user_email) LIKE (SELECT regex FROM X)
OR LOWER(chat.end_user_phone) LIKE (SELECT regex FROM X)
OR LOWER(chat.end_user_url) LIKE (SELECT regex FROM X)
OR LOWER(chat_history_comments.comment) LIKE (SELECT regex FROM X)
GROUP BY chat_base_id;
