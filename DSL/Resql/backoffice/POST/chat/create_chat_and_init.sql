INSERT INTO chat (
    base_id,
    customer_support_id,
    customer_support_display_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    status,
    created,
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
    received_from_name,
    csa_title
)
VALUES (
    :id,
    CASE
        WHEN :is_bot_active = 'true' THEN :bot_institution_id
        ELSE ''
    END,
    CASE
        WHEN :is_bot_active = 'true' THEN 'Bürokratt'
        ELSE ''
    END,
    :endUserId,
    :endUserFirstName,
    :endUserLastName,
    :status,
    CASE 
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, now())
    END,
    (CASE
        WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        WHEN (:ended = '') THEN NULL
        WHEN (:ended = 'null') THEN NULL
        ELSE :ended::TIMESTAMP WITH TIME ZONE
    END)::TIMESTAMP WITH TIME ZONE,
    :endUserEmail,
    :endUserPhone,
    :endUserOs,
    :endUserUrl,
    :feedbackText,
    (NULLIF(:feedbackRating, '')::INTEGER),
    :externalId,
    :forwardedTo,
    :forwardedToName,
    :receivedFrom,
    :receivedFromName,
    CASE
        WHEN :is_bot_active = 'true' THEN ''
    ELSE ''
)
RETURNING customer_support_id, customer_support_display_name, csa_title, updated::TEXT;;
