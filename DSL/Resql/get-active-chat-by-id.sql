SELECT c.base_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    (
        CASE
            WHEN (
                SELECT value
                FROM configuration
                WHERE KEY = 'is_csa_title_visible'
                    AND deleted = FALSE
                ORDER BY created DESC
                LIMIT 1
            ) = 'true' THEN c.csa_title
            ELSE ''
        END
    ) AS csa_title,
    c.end_user_id,
    c.end_user_first_name,
    c.end_user_last_name,
    c.status,
    c.end_user_email,
    c.end_user_phone,
    c.end_user_os,
    c.end_user_url,
    c.feedback_text,
    c.feedback_rating,
    c.created,
    c.updated,
    c.ended,
    c.external_id,
    c.forwarded_to,
    c.forwarded_to_name,
    c.received_from,
    c.received_from_name,
    m.content AS last_message,
    m.updated AS last_message_timestamp
FROM (
        SELECT 
          base_id,
          customer_support_id,
          customer_support_display_name,
          csa_title,
          end_user_id,
          end_user_first_name,
          end_user_last_name,
          status,
          end_user_email,
          end_user_phone,
          end_user_os,
          end_user_url,
          feedback_text,
          feedback_rating,
          created,
          updated,
          ended,
          external_id,
          forwarded_to,
          forwarded_to_name,
          received_from,
          received_from_name
        FROM chat
        WHERE base_id = :id
        ORDER BY updated DESC
        LIMIT 1
    ) AS c
    JOIN message AS m ON c.base_id = m.chat_base_id
WHERE c.ended IS NULL
ORDER BY m.updated DESC
LIMIT 1;
