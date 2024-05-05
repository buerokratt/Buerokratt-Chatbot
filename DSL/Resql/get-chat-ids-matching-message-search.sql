WITH consts AS (
  SELECT E' ' AS regxE1,
         E'%' AS regxE2,
         'g' AS regxE3,
         E'(.*)' AS regxE4,
         E'%\\1%' AS regxE5
), regx AS (
  SELECT lower(regexp_replace(regexp_replace(:searchKey, consts.regxE1, consts.regxE2, consts.regxE3), consts.regxE4, consts.regxE5, consts.regxE3)) AS search_key
  FROM consts
)
SELECT chat_base_id AS chat_id
FROM message
LEFT JOIN chat ON message.chat_base_id = chat.base_id
LEFT JOIN chat_history_comments ON message.chat_base_id = chat_history_comments.chat_id 
WHERE EXISTS (
  SELECT 1
  FROM regx
  WHERE lower(content) LIKE regx.search_key
     OR lower(chat_base_id) LIKE regx.search_key     
     OR lower(chat.customer_support_display_name) LIKE regx.search_key
     OR lower(chat.end_user_first_name) LIKE regx.search_key
     OR lower(chat.end_user_last_name) LIKE regx.search_key
     OR lower(chat.end_user_id) LIKE regx.search_key
     OR lower(chat.end_user_email) LIKE regx.search_key
     OR lower(chat.end_user_phone) LIKE regx.search_key
     OR lower(chat.end_user_url) LIKE regx.search_key      
     OR lower(chat_history_comments.comment) LIKE regx.search_key
)
GROUP BY chat_base_id;
