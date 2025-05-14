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
        'last_message_author_id', '', :lastMessageAuthorId,
        'last_message_event', '', :lastMessageEvent,
        'last_message_including_empty_content', '', :content,
        'last_non_empty_message_event', '', 
            CASE
                WHEN :lastMessageEvent::TEXT = '' THEN last_non_empty_message_event
                ELSE :lastMessageEvent::VARCHAR
            END,
        'last_message_event_with_content', '', 
            CASE
                WHEN :content::TEXT = '' THEN last_message_event_with_content
                ELSE :lastMessageEvent::VARCHAR
            END,
        'contacts_message', '', 
            CASE
                WHEN :lastMessageEvent::TEXT = 'contact-information-fulfilled' THEN :content::VARCHAR
                ELSE contacts_message
            END,
        'last_message_with_content_and_not_rating_or_forward', '', 
            CASE
                WHEN :content::TEXT <> '' AND
                    :content::TEXT <> 'message-read' AND 
                    :lastMessageEvent::TEXT <> 'rating' AND 
                    :lastMessageEvent::TEXT <> 'requested-chat-forward' 
                THEN :content::VARCHAR
                ELSE last_message_with_content_and_not_rating_or_forward
            END,
        'last_message', '', 
            CASE
                WHEN :content::TEXT = '' THEN last_message::VARCHAR
                ELSE :content
            END,
        'first_message', '', 
            CASE
                WHEN :content::TEXT <> '' AND (first_message = '' OR first_message is NULL) THEN :content::VARCHAR
                ELSE first_message
            END,
        'customer_messages_count', '::INTEGER', 
            CASE
                WHEN :isCustomerMessage::BOOLEAN = TRUE THEN (COALESCE(customer_messages_count, 0) + 1)::TEXT
                ELSE COALESCE(customer_messages_count, 0)::TEXT
            END,
        'csa_title', '', 
            CASE
                WHEN :csaTitle::TEXT = 'null' THEN NULL
                WHEN :csaTitle::TEXT = '' THEN NULL
                ELSE :csaTitle::VARCHAR
            END,
        'last_message_with_not_rating_or_forward_events_timestamp', '', 
            CASE
                WHEN :lastMessageEvent::TEXT <> 'rating' AND 
                    :lastMessageEvent::TEXT <> 'requested-chat-forward' 
                THEN CASE
                    WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                    WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                    WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()::VARCHAR
                    ELSE :lastMessageTimestamp::VARCHAR
                END
                ELSE last_message_with_not_rating_or_forward_events_timestamp::VARCHAR
            END,
        'first_message_timestamp', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :content::TEXT <> '' AND first_message_timestamp IS NULL THEN
                    CASE
                        WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                        WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                        WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()::VARCHAR
                        ELSE :lastMessageTimestamp::VARCHAR
                    END
                ELSE first_message_timestamp::VARCHAR
            END,
        'last_message_timestamp', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :lastMessageTimestamp::VARCHAR
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
            END,
        'first_support_timestamp', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :isSupportMessage::BOOLEAN = TRUE AND first_support_timestamp IS NULL THEN :authorTimestamp::VARCHAR
                ELSE first_support_timestamp::VARCHAR
            END,
        'chat_duration_in_seconds', '::NUMERIC', 
            CASE
                WHEN :isSupportMessage::BOOLEAN = TRUE AND first_support_timestamp IS NULL THEN 0::TEXT
                ELSE ABS(EXTRACT(EPOCH FROM (first_support_timestamp::TIMESTAMP WITH TIME ZONE - :authorTimestamp::TIMESTAMP WITH TIME ZONE)))::TEXT
            END,
        'all_messages', '::TEXT[]', 
            CASE
                WHEN :content::TEXT <> '' THEN 
                    CASE
                        WHEN all_messages IS NULL THEN ARRAY[:content]::TEXT[]
                        ELSE (all_messages || :content)::TEXT[]
                    END::TEXT
                ELSE all_messages::TEXT
            END
    ]::VARCHAR[]
)
FROM denormalized_chat
WHERE chat_id = :chatId
ORDER BY id DESC
LIMIT 1;