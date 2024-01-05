INSERT INTO chat(base_id, customer_support_id, customer_support_display_name, end_user_id, end_user_first_name,
                 end_user_last_name, status, created, ended, end_user_email, end_user_phone, end_user_os, end_user_url, feedback_text, feedback_rating,
                 external_id, forwarded_to, forwarded_to_name, received_from, received_from_name, csa_title)
VALUES (:id,
        (CASE
             WHEN ((SELECT value
                    FROM configuration
                    WHERE key = 'is_bot_active'
                      AND id IN (SELECT max(id) from configuration GROUP BY key)
                      AND deleted = FALSE) = 'true') THEN (SELECT value
                                                           FROM configuration
                                                           WHERE key = 'bot_institution_id'
                                                             AND id IN (SELECT max(id) from configuration GROUP BY key)
                                                             AND deleted = FALSE)
             ELSE '' END),
        (CASE
             WHEN ((SELECT value
                    FROM configuration
                    WHERE key = 'is_bot_active'
                      AND id IN (SELECT max(id) from configuration GROUP BY key)
                      AND deleted = FALSE) = 'true') THEN 'Bürokratt'
             ELSE '' END),
        :endUserId, :endUserFirstName, :endUserLastName, :status, :created::timestamp with time zone,
        (CASE
             WHEN (:ended = '') THEN null
             WHEN (:ended = 'null') THEN null
             ELSE :ended END):: timestamp with time zone,
        :endUserEmail, :endUserPhone, :endUserOs, :endUserUrl, :feedbackText, :feedbackRating, :externalId, :forwardedTo, :forwardedToName,
        :receivedFrom, :receivedFromName,         (CASE
                                                       WHEN ((SELECT value
                                                              FROM configuration
                                                              WHERE key = 'is_bot_active'
                                                                AND id IN (SELECT max(id) from configuration GROUP BY key)
                                                                AND deleted = FALSE) = 'true') THEN ''
                                                       ELSE '' END));