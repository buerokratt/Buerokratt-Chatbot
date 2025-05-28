/*
declaration:
  version: 0.1
  description: "Insert a denormalized snapshot of chat data including metadata, messages, labels, and events"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Unique identifier for the chat"
      - field: customerSupportId
        type: string
        description: "ID of the assigned customer support agent"
      - field: customerSupportDisplayName
        type: string
        description: "Display name of the assigned customer support agent"
      - field: customerSupportFirstName
        type: string
        description: "First name of the customer support agent"
      - field: customerSupportLastName
        type: string
        description: "Last name of the customer support agent"
      - field: endUserId
        type: string
        description: "ID of the end user"
      - field: endUserFirstName
        type: string
        description: "First name of the end user"
      - field: endUserLastName
        type: string
        description: "Last name of the end user"
      - field: endUserEmail
        type: string
        description: "Email address of the end user"
      - field: endUserPhone
        type: string
        description: "Phone number of the end user"
      - field: endUserOs
        type: string
        description: "Operating system of the end user"
      - field: endUserUrl
        type: string
        description: "URL visited by the end user during the chat"
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Status of the chat"
      - field: created
        type: timestamp
        description: "Timestamp when the chat was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the chat was last updated"
      - field: ended
        type: timestamp
        description: "Timestamp when the chat ended"
      - field: forwardedTo
        type: string
        description: "ID of the agent the chat was forwarded to"
      - field: forwardedToName
        type: string
        description: "Name of the agent the chat was forwarded to"
      - field: receivedFrom
        type: string
        description: "ID of the source from which the chat was received"
      - field: receivedFromName
        type: string
        description: "Name of the source from which the chat was received"
      - field: externalId
        type: string
        description: "External system identifier for the chat"
      - field: feedbackText
        type: string
        description: "Feedback text provided by the end user"
      - field: feedbackRating
        type: integer
        description: "Feedback rating provided by the end user"
      - field: csaTitle
        type: string
        description: "Title of the customer support agent"
      - field: firstMessageTimestamp
        type: timestamp
        description: "Timestamp of the first message in the chat"
      - field: lastMessageTimestamp
        type: timestamp
        description: "Timestamp of the last message in the chat"
      - field: comment
        type: string
        description: "Comment attached to the chat"
      - field: commentAddedDate
        type: string
        description: "Timestamp when the comment was added"
      - field: commentAuthor
        type: string
        description: "Author of the chat comment"
      - field: firstMessage
        type: string
        description: "Content of the first message (if not system message)"
      - field: lastMessage
        type: string
        description: "Content of the last message (if not system message)"
      - field: lastMessageIncludingEmptyContent
        type: string
        description: "Last message including empty or system messages"
      - field: contactsMessage
        type: string
        description: "Contacts message if any (like contact card)"
      - field: lastMessageEvent
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Type of the last message event"
      - field: lastMessageEventWithContent
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Type of the last message event that had content"
      - field: chatDurationInSeconds
        type: integer
        description: "Duration of the chat in seconds"
      - field: customerMessagesCount
        type: integer
        description: "Number of messages sent by the customer"
      - field: labels
        type: array
        items:
          type: string
        description: "List of labels associated with the chat"
      - field: lastMessageWithContentAndNotRatingOrForward
        type: string
        description: "Content of the last meaningful message (excluding rating and forward)"
      - field: lastMessageWithNotRatingOrForwardEventsTimestamp
        type: timestamp
        description: "Timestamp of last message not related to rating or forward"
      - field: lastNonEmptyMessageEvent
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Event type of the last non-empty message"
      - field: allMessages
        type: array
        items:
          type: string
        description: "All messages in the chat"
      - field: firstSupportTimestamp
        type: string
        description: "Timestamp when the support agent first responded"
*/
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