SELECT c.customer_support_display_name,
       m.content AS last_message,
       m.updated AS last_message_timestamp
FROM (
  SELECT base_id,
         customer_support_display_name
  FROM chat
  WHERE base_id = :id
  ORDER BY updated DESC
  LIMIT 1
) AS c
JOIN message AS m ON c.base_id = m.chat_base_id
ORDER BY m.updated DESC
LIMIT 6;