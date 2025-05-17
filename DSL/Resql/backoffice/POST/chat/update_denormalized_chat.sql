-- Using array approach directly
SELECT copy_row_with_modifications(
    'denormalized_chat',                              -- Table name for denormalized_chat
    'id', '::INTEGER', id::VARCHAR,                   -- ID column handling
    ARRAY[                                            -- Direct array of modifications
        'chat_id', '', :chatId,
        'customer_support_id', '', :customerSupportId,
        'customer_support_display_name', '', 
            CASE
                WHEN :customerSupportDisplayName::TEXT = 'null' AND :customerSupportId::TEXT = customer_support_id::TEXT 
                    THEN customer_support_display_name
                WHEN :customerSupportDisplayName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportDisplayName
            END,
        'customer_support_first_name', '', 
            CASE
                WHEN :customerSupportFirstName::TEXT = 'null' AND :customerSupportId::TEXT = customer_support_id::TEXT 
                    THEN customer_support_first_name
                WHEN :customerSupportFirstName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportFirstName
            END,
        'customer_support_last_name', '', 
            CASE
                WHEN :customerSupportLastName::TEXT = 'null' AND :customerSupportId::TEXT = customer_support_id::TEXT 
                    THEN customer_support_last_name
                WHEN :customerSupportLastName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportLastName
            END,
        'status', '', :status,
        'ended', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :ended::TEXT = '' THEN NULL
                WHEN :ended::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :ended::VARCHAR
            END,
        'feedback_text', '', :feedbackText,
        'feedback_rating', '::INTEGER', NULLIF(:feedbackRating::TEXT, ''),
        'external_id', '', :externalId,
        'forwarded_to', '', :forwardedTo,
        'forwarded_to_name', '', :forwardedToName,
        'received_from', '', :receivedFrom,
        'received_from_name', '', :receivedFromName,
        'end_user_id', '', :endUserId,
        'end_user_first_name', '', :endUserFirstName,
        'end_user_last_name', '', :endUserLastName,
        'end_user_email', '', :endUserEmail,
        'end_user_phone', '', :endUserPhone,
        'end_user_os', '', :endUserOs,
        'end_user_url', '', :endUserUrl,
        'csa_title', '', 
            CASE
                WHEN :csaTitle::TEXT = 'null' THEN NULL
                WHEN :csaTitle::TEXT = '' THEN NULL
                ELSE :csaTitle::VARCHAR
            END,
        'updated', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END,
        'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END
    ]::VARCHAR[]
)
FROM denormalized_chat
WHERE chat_id = :chatId
ORDER BY id DESC
LIMIT 1;