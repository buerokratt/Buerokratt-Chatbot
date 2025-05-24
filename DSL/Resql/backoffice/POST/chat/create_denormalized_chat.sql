INSERT INTO chat.denormalized_chat (
    chat_id,
    customer_support_id,
    customer_support_display_name,
    customer_support_first_name,
    customer_support_last_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    end_user_email,
    end_user_phone,
    end_user_os,
    end_user_url,
    status,
    created,
    updated,
    denormalized_record_created,
    ended,
    forwarded_to,
    forwarded_to_name,
    received_from,
    received_from_name,
    external_id,
    feedback_text,
    feedback_rating,
    csa_title,
    first_message_timestamp,
    last_message_timestamp,
    comment,
    comment_added_date,
    comment_author,
    first_message,
    last_message,
    last_message_including_empty_content,
    contacts_message,
    last_message_event,
    last_message_event_with_content,
    chat_duration_in_seconds,
    customer_messages_count,
    labels,
    last_message_with_content_and_not_rating_or_forward,
    last_message_with_not_rating_or_forward_events_timestamp,
    last_non_empty_message_event,
    all_messages,
    first_support_timestamp
)
VALUES (
    :chatId,
    CASE WHEN :customerSupportId = 'null' THEN NULL ELSE :customerSupportId END,
    CASE WHEN :customerSupportDisplayName = 'null' THEN NULL ELSE :customerSupportDisplayName END,
    CASE WHEN :customerSupportFirstName = 'null' THEN NULL ELSE :customerSupportFirstName END,
    CASE WHEN :customerSupportLastName = 'null' THEN NULL ELSE :customerSupportLastName END,
    CASE WHEN :endUserId = 'null' THEN NULL ELSE :endUserId END,
    CASE WHEN :endUserFirstName = 'null' THEN NULL ELSE :endUserFirstName END,
    CASE WHEN :endUserLastName = 'null' THEN NULL ELSE :endUserLastName END,
    CASE WHEN :endUserEmail = 'null' THEN NULL ELSE :endUserEmail END,
    CASE WHEN :endUserPhone = 'null' THEN NULL ELSE :endUserPhone END,
    CASE WHEN :endUserOs = 'null' THEN NULL ELSE :endUserOs END,
    CASE WHEN :endUserUrl = 'null' THEN NULL ELSE :endUserUrl END,
    CASE WHEN :status = 'null' THEN NULL ELSE :status::chat_status_type END,
    CASE 
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, now())
    END,
    CASE
        WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:updated::TIMESTAMP WITH TIME ZONE, now())
    END,
    CASE
        WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:updated::TIMESTAMP WITH TIME ZONE, now())
    END,
    (
        CASE
            WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN now()
            WHEN (:ended = '') THEN null 
            WHEN (:ended = 'null') THEN null
            ELSE :ended::TIMESTAMP WITH TIME ZONE
        END
    )::TIMESTAMP WITH TIME ZONE,
    CASE WHEN :forwardedTo = 'null' THEN NULL ELSE :forwardedTo END,
    CASE WHEN :forwardedToName = 'null' THEN NULL ELSE :forwardedToName END,
    CASE WHEN :receivedFrom = 'null' THEN NULL ELSE :receivedFrom END,
    CASE WHEN :receivedFromName = 'null' THEN NULL ELSE :receivedFromName END,
    CASE WHEN :externalId = 'null' THEN NULL ELSE :externalId END,
    CASE WHEN :feedbackText = 'null' THEN NULL ELSE :feedbackText END,
    CASE WHEN :feedbackRating = 'null' THEN NULL ELSE NULLIF(:feedbackRating::TEXT, '')::INTEGER END,
    CASE WHEN :csaTitle = 'null' THEN NULL ELSE :csaTitle END,
    CASE WHEN :firstMessageTimestamp = 'null' THEN NULL ELSE :firstMessageTimestamp::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN :lastMessageTimestamp = 'null' THEN NULL ELSE :lastMessageTimestamp::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN :comment = 'null' THEN NULL ELSE :comment END,
    CASE WHEN :commentAddedDate = 'null' THEN NULL ELSE :commentAddedDate::TIMESTAMP WITH TIME ZONE END,
    CASE WHEN :commentAuthor = 'null' THEN NULL ELSE :commentAuthor END,
    CASE WHEN :firstMessage IN ('null', '', 'message-read') THEN NULL ELSE :firstMessage END,
    CASE WHEN :lastMessage IN ('null', '', 'message-read') THEN NULL ELSE :lastMessage END,
    CASE WHEN :lastMessageIncludingEmptyContent = 'null' THEN NULL ELSE :lastMessageIncludingEmptyContent END,
    CASE WHEN :contactsMessage = 'null' THEN NULL ELSE :contactsMessage END,
    CASE WHEN :lastMessageEvent = 'null' THEN NULL ELSE LOWER(:lastMessageEvent)::event_type END,
    CASE WHEN :lastMessageEventWithContent = 'null' THEN NULL ELSE LOWER(:lastMessageEventWithContent)::event_type END,
    CASE WHEN (:chatDurationInSeconds::TEXT) = 'null' THEN NULL ELSE NULLIF(:chatDurationInSeconds::TEXT, '')::NUMERIC END,
    NULLIF(:customerMessagesCount::TEXT, '')::INTEGER,
    CASE WHEN :labels = 'null' THEN NULL ELSE :labels::VARCHAR[] END,
    CASE 
        WHEN :lastMessage IS NOT NULL AND :lastMessage <> '' AND :lastMessage <> 'message-read' AND :lastMessageEvent <> 'rating' AND :lastMessageEvent <> 'requested-chat-forward' 
        THEN :lastMessage
        ELSE null 
    END,
    (CASE 
        WHEN :lastMessageEvent <> 'rating' AND :lastMessageEvent <> 'requested-chat-forward'
        THEN :updated::TIMESTAMP WITH TIME ZONE
        ELSE null
    END)::TIMESTAMP WITH TIME ZONE,
    CASE WHEN :lastNonEmptyMessageEvent = 'null' THEN NULL ELSE LOWER(:lastNonEmptyMessageEvent)::event_type END,
    ARRAY[:allMessages]::TEXT[],
    (
        CASE
            WHEN :firstSupportTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN now()
            WHEN (:firstSupportTimestamp = '') THEN null 
            WHEN (:firstSupportTimestamp = 'null') THEN null
            ELSE :firstSupportTimestamp::TIMESTAMP WITH TIME ZONE
        END
    )::TIMESTAMP WITH TIME ZONE
);