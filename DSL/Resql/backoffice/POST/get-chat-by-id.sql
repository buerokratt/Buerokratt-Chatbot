SELECT c.base_id AS id,
       c.customer_support_id,
       c.customer_support_display_name,
       c.end_user_id,
       c.end_user_first_name,
       c.end_user_last_name,
       c.status,
       c.feedback_text,
       c.feedback_rating,
       c.end_user_email,
       c.end_user_phone,
       c.end_user_os,
       c.end_user_url,
       c.created,
       c.updated,
       c.ended,
       c.external_id,
       c.received_from,
       c.received_from_name,
       c.forwarded_to_name,
       c.forwarded_to,
       (CASE WHEN (SELECT value FROM configuration WHERE key = 'is_csa_title_visible' AND configuration.id IN (SELECT max(id) from configuration GROUP BY key) AND deleted = false) = 'true'
                 THEN c.csa_title ELSE '' END) AS csa_title,          
       m.content AS last_message,
       m.updated AS last_message_timestamp
FROM (
  SELECT 
    base_id,
    customer_support_id,
    customer_support_display_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    status,
    feedback_text,
    feedback_rating,
    end_user_email,
    end_user_phone,
    end_user_os,
    end_user_url,
    created,
    updated,
    ended,
    external_id,
    received_from,
    received_from_name,
    forwarded_to_name,
    forwarded_to,
    csa_title
  FROM chat
  WHERE base_id = :id
  ORDER BY updated DESC
  LIMIT 1
) AS c
JOIN message AS m ON c.base_id = m.chat_base_id
ORDER BY m.updated DESC
LIMIT 1;
