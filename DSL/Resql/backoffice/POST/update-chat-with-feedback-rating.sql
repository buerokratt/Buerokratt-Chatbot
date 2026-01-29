WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' GROUP BY key)
      AND NOT deleted
)
INSERT INTO chat(base_id, customer_support_id, customer_support_display_name, end_user_id, end_user_first_name,
                 end_user_last_name, status, created, ended, end_user_email, end_user_phone, end_user_os, end_user_url, 
                 feedback_text, feedback_rating, feedback_rating_five,
                 external_id, forwarded_to, forwarded_to_name, received_from, received_from_name, csa_title)
SELECT base_id,
       customer_support_id,
       customer_support_display_name,
       end_user_id,
       end_user_first_name,
       end_user_last_name,
       status,
       :created::timestamp with time zone,
       ended::timestamp with time zone,
       end_user_email,
       end_user_phone,
       end_user_os,
       end_user_url,
       feedback_text,
       CASE 
           WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
           THEN NULL
           ELSE :feedback_rating
       END,
       CASE 
           WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
           THEN :feedback_rating
           ELSE NULL
       END,
       external_id,
       forwarded_to,
       forwarded_to_name,
       received_from,
       received_from_name,
       csa_title
FROM chat
WHERE base_id = :id
ORDER BY updated DESC
LIMIT 1;
