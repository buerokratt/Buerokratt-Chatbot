SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       c.status,
       c.end_user_email,
       c.end_user_phone,
       c.end_user_os,
       c.end_user_url,
       c.created,
       c.updated,
       c.ended,
       c.external_id,
       c.received_from,
       c.forwarded_to_name,
       c.forwarded_to,
       (CASE WHEN (SELECT value FROM configuration WHERE key = 'is_csa_title_visible' AND configuration.id IN (SELECT max(id) from configuration GROUP BY key) AND deleted = false) = 'true'
                 THEN c.csa_title ELSE '' END) AS csa_title,          
       m.content AS last_message,
       m.updated AS last_message_timestamp
FROM (SELECT *
      FROM chat
      WHERE base_id = :id
      ORDER BY updated DESC
      LIMIT 1) AS c
         JOIN message AS m ON c.base_id = m.chat_base_id
ORDER BY m.updated DESC
LIMIT 1;
