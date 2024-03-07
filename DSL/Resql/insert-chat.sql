INSERT INTO chat(base_id, customer_support_id, customer_support_display_name, end_user_id, end_user_first_name,
                 end_user_last_name, status, created, ended, end_user_email, end_user_phone, end_user_os, end_user_url, feedback_text, feedback_rating,
                 external_id, forwarded_to, forwarded_to_name, received_from, received_from_name, csa_title)
VALUES (:id, :customerSupportId, :customerSupportDisplayName, :endUserId, :endUserFirstName,
        :endUserLastName, :status, :created::timestamp with time zone,
        (CASE WHEN (:ended = '') THEN null WHEN (:ended = 'null') THEN null ELSE :ended END)::timestamp with time zone,
        :endUserEmail, :endUserPhone, :endUserOs, :endUserUrl, :feedbackText, (NULLIF(:feedbackRating, '')::integer), :externalId, :forwardedTo, :forwardedToName,
        :receivedFrom, :receivedFromName, (CASE WHEN (:csaTitle = 'null') THEN null WHEN (:csaTitle = '') THEN null ELSE :csaTitle END));
