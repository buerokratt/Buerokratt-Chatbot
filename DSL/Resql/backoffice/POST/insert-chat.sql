WITH rating_config AS (
    SELECT value AS is_five_rating_scale
    FROM configuration
    WHERE key = 'isFiveRatingScale'
      AND "domain" IS NULL
      AND id IN (SELECT max(id) FROM configuration WHERE key = 'isFiveRatingScale' AND "domain" IS NULL)
      AND NOT deleted
)
INSERT INTO chat(base_id, customer_support_id, customer_support_display_name, end_user_id, end_user_first_name,
                 end_user_last_name, status, created, ended, end_user_email, end_user_phone, end_user_os, end_user_url, 
                 feedback_text, feedback_rating, feedback_rating_five,
                 external_id, forwarded_to, forwarded_to_name, received_from, received_from_name, csa_title)
VALUES (:id, :customerSupportId, :customerSupportDisplayName, :endUserId, :endUserFirstName,
        :endUserLastName, :status, :created::timestamp with time zone,
        (CASE WHEN (:ended = '') THEN null WHEN (:ended = 'null') THEN null ELSE :ended END)::timestamp with time zone,
        :endUserEmail, :endUserPhone, :endUserOs, :endUserUrl, :feedbackText, 
        CASE 
            WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
            THEN NULL
            ELSE NULLIF(:feedbackRating::text, '')::integer
        END,
        CASE 
            WHEN (SELECT COALESCE(is_five_rating_scale, 'false') = 'true' FROM rating_config) 
            THEN NULLIF(:feedbackRating::text, '')::integer
            ELSE NULL
        END,
        :externalId, :forwardedTo, :forwardedToName,
        :receivedFrom, :receivedFromName, 
        (CASE WHEN (:csaTitle = 'null') THEN null WHEN (:csaTitle = '') THEN null ELSE :csaTitle END));
