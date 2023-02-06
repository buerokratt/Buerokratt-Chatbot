INSERT INTO chat(base_id, customer_support_id, customer_support_display_name, csa_title, end_user_id, end_user_first_name,
                 end_user_last_name, status, created, ended, end_user_email, end_user_phone, end_user_os, end_user_url, feedback_text, feedback_rating,
                 external_id, forwarded_to, forwarded_to_name, received_from, received_from_name)
SELECT base_id,
       '',
       '',
       '',
       end_user_id,
       end_user_first_name,
       end_user_last_name,
       status,
       :created::timestamp with time zone,
       ended,
       end_user_email,
       end_user_phone,
       end_user_os,
       end_user_url,
       feedback_text,
       feedback_rating,
       external_id,
       forwarded_to,
       forwarded_to_name,
       received_from,
       received_from_name
FROM chat
WHERE id IN (SELECT MAX(id) FROM chat GROUP BY base_id)
  AND customer_support_id = :customerSupportId
  AND ended IS null;