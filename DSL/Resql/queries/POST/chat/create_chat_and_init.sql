WITH
    consts AS (
        SELECT 'is_bot_active' AS is_bot_active
    )

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
    (CASE
        WHEN ((
            SELECT value
            FROM configuration
            WHERE
                key = (SELECT is_bot_active FROM consts)
                AND id IN (
                    SELECT MAX(id) FROM configuration
                    GROUP BY key
                )
                AND deleted = FALSE
        ) = 'true')
            THEN (
                SELECT value
                FROM configuration
                WHERE
                    key = 'bot_institution_id'
                    AND id IN (
                        SELECT MAX(id) FROM configuration
                        GROUP BY key
                    )
                    AND deleted = FALSE
            )
        ELSE ''
    END),
    (CASE
        WHEN ((
            SELECT value
            FROM configuration
            WHERE
                key = (SELECT is_bot_active FROM consts)
                AND id IN (
                    SELECT MAX(id) FROM configuration
                    GROUP BY key
                )
                AND deleted = FALSE
        ) = 'true') THEN 'Bürokratt'
        ELSE ''
    END),
    :endUserId,
    :endUserFirstName,
    :endUserLastName,
    :status,
    :created::TIMESTAMP WITH TIME ZONE,
    (CASE
        WHEN (:ended = '') THEN NULL
        WHEN (:ended = 'null') THEN NULL
        ELSE :ended
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
    :receivedFrom, :receivedFromName, (CASE
        WHEN ((
            SELECT value
            FROM configuration
            WHERE
                key = (SELECT is_bot_active FROM consts)
                AND id IN (
                    SELECT MAX(id) FROM configuration
                    GROUP BY key
                )
                AND deleted = FALSE
        ) = 'true') THEN ''
        ELSE ''
    END)
);
