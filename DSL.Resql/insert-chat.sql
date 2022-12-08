INSERT INTO chat(base_id, customer_support_id, customer_support_display_name, end_user_id, end_user_first_name,
                 end_user_last_name, status, created, ended, end_user_os, end_user_url, feedback_text, feedback_rating,
                 external_id, forwarded_to, forwarded_to_name, received_from, received_from_name, title)
VALUES (:id, :customerSupportId, :customerSupportDisplayName, :endUserId, :endUserFirstName,
        :endUserLastName, :status, :created::timestamp with time zone,
        (CASE WHEN (:ended = '') THEN null WHEN (:ended = 'null') THEN null ELSE :ended END)::timestamp with time zone,
        :endUserOs, :endUserUrl, :feedbackText, :feedbackRating, :externalId, :forwardedTo, :forwardedToName,
        :receivedFrom, :receivedFromName, (CASE WHEN (:title = 'null') THEN null WHEN (:title = '') THEN null ELSE :title END));