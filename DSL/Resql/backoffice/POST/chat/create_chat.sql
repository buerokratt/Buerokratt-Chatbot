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
    :id, :customerSupportId, :customerSupportDisplayName, :endUserId, :endUserFirstName,
    :endUserLastName, :status::chat_status_type, 
    CASE 
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, now())
    END,
    (
        CASE
            WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN now()
            WHEN (:ended = '') THEN null WHEN (:ended = 'null') THEN now()
            ELSE :ended::TIMESTAMP WITH TIME ZONE
        END
    )::TIMESTAMP WITH TIME ZONE,
    :endUserEmail,
    :endUserPhone,
    :endUserOs,
    :endUserUrl,
    :feedbackText,
    (NULLIF(:feedbackRating::TEXT, '')::INTEGER),
    :externalId,
    :forwardedTo,
    :forwardedToName,
    :receivedFrom,
    :receivedFromName,
    (
        CASE
            WHEN (:csaTitle = 'null') THEN null WHEN (:csaTitle = '') THEN null ELSE
                :csaTitle
        END
    )
) RETURNING id, updated::TEXT;
