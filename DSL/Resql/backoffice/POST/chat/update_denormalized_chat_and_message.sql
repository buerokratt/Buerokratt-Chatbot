/*
declaration:
  version: 0.1
  description: "Update the latest denormalized chat message record with message event, content, author, and support details"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Chat ID for which the denormalized record should be updated"
      - field: customerSupportId
        type: string
        description: "ID of the customer support agent"
      - field: customerSupportDisplayName
        type: string
        description: "Display name of the support agent"
      - field: customerSupportFirstName
        type: string
        description: "First name of the support agent"
      - field: customerSupportLastName
        type: string
        description: "Last name of the support agent"
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Status of the chat"
      - field: ended
        type: timestamp
        description: "Timestamp when the chat ended"
      - field: feedbackText
        type: string
        description: "Text feedback provided by the user"
      - field: feedbackRating
        type: integer
        description: "Rating provided by the user"
      - field: externalId
        type: string
        description: "External system reference ID"
      - field: forwardedTo
        type: string
        description: "ID of the agent chat was forwarded to"
      - field: forwardedToName
        type: string
        description: "Name of the agent chat was forwarded to"
      - field: receivedFrom
        type: string
        description: "ID from which the chat was received"
      - field: receivedFromName
        type: string
        description: "Name from which the chat was received"
      - field: lastMessageAuthorId
        type: string
        description: "ID of the last message author"
      - field: lastMessageEvent
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Event type of the last message"
      - field: content
        type: string
        description: "Content of the last message"
      - field: lastMessageTimestamp
        type: timestamp
        description: "Timestamp of the last message"
      - field: isCustomerMessage
        type: boolean
        description: "True if the message is from a customer"
      - field: csaTitle
        type: string
        description: "Title of the customer support agent"
      - field: updated
        type: timestamp
        description: "Timestamp for the update"
      - field: isSupportMessage
        type: boolean
        description: "True if the message is from support and used to start duration tracking"
      - field: authorTimestamp
        type: timestamp
        description: "Timestamp when the message was authored"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp when the denormalized message record was updated"
*/
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        -- Table name for denormalized_chat
        'chat.denormalized_chat',
        'id', '::UUID', id::VARCHAR,                   -- ID column handling
        -- Direct array of modifications
        ARRAY[
            'chat_id', '', :chatId,
            'customer_support_id', '', :customerSupportId,
            'customer_support_display_name', '',
            CASE
                WHEN
                    :customerSupportDisplayName::TEXT = 'null'
                    AND :customerSupportId::TEXT = customer_support_id::TEXT
                    THEN customer_support_display_name
                WHEN :customerSupportDisplayName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportDisplayName
            END,
            'customer_support_first_name', '',
            CASE
                WHEN
                    :customerSupportFirstName::TEXT = 'null'
                    AND :customerSupportId::TEXT = customer_support_id::TEXT
                    THEN customer_support_first_name
                WHEN :customerSupportFirstName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportFirstName
            END,
            'customer_support_last_name', '',
            CASE
                WHEN
                    :customerSupportLastName::TEXT = 'null'
                    AND :customerSupportId::TEXT = customer_support_id::TEXT
                    THEN customer_support_last_name
                WHEN :customerSupportLastName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportLastName
            END,
            'status', '::chat_status_type', :status,
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
            'last_message_event', '::event_type', LOWER(:lastMessageEvent),
            'last_message_including_empty_content', '', :content,
            'last_non_empty_message_event', '::event_type',
            CASE
                WHEN
                    :lastMessageEvent::TEXT = ''
                    THEN last_non_empty_message_event::VARCHAR
                ELSE LOWER(:lastMessageEvent)
            END,
            'last_message_event_with_content', '::event_type',
            CASE
                WHEN :content::TEXT = '' THEN last_message_event_with_content::VARCHAR
                ELSE LOWER(:lastMessageEvent)
            END,
            'contacts_message', '',
            CASE
                WHEN
                    :lastMessageEvent::TEXT = 'contact-information-fulfilled'
                    THEN :content::VARCHAR
                ELSE contacts_message
            END,
            'last_message_with_content_and_not_rating_or_forward', '',
            CASE
                WHEN
                    :content::TEXT <> ''
                    AND :content::TEXT <> 'message-read'
                    AND :lastMessageEvent::TEXT <> 'rating'
                    AND :lastMessageEvent::TEXT <> 'requested-chat-forward'
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
                WHEN
                    :content::TEXT <> ''
                    AND (first_message = '' OR first_message IS NULL)
                    THEN :content::VARCHAR
                ELSE first_message
            END,
            'customer_messages_count', '::INTEGER',
            CASE
                WHEN
                    :isCustomerMessage::BOOLEAN = TRUE
                    THEN (COALESCE(customer_messages_count, 0) + 1)::TEXT
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
                WHEN
                    :lastMessageEvent::TEXT <> 'rating'
                    AND :lastMessageEvent::TEXT <> 'requested-chat-forward'
                    THEN CASE
                        WHEN
                            :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP'
                            THEN NOW()::VARCHAR
                        WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                        WHEN
                            :lastMessageTimestamp::TEXT = 'null'
                            THEN NOW()::VARCHAR
                        ELSE :lastMessageTimestamp::VARCHAR
                    END
                ELSE last_message_with_not_rating_or_forward_events_timestamp::VARCHAR
            END,
            'first_message_timestamp', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :content::TEXT <> '' AND first_message_timestamp IS NULL
                    THEN
                        CASE
                            WHEN
                                :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP'
                                THEN NOW()::VARCHAR
                            WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                            WHEN
                                :lastMessageTimestamp::TEXT = 'null'
                                THEN NOW()::VARCHAR
                            ELSE :lastMessageTimestamp::VARCHAR
                        END
                ELSE first_message_timestamp::VARCHAR
            END,
            'last_message_timestamp', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN
                    :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP'
                    THEN NOW()::VARCHAR
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
                WHEN
                    :isSupportMessage::BOOLEAN = TRUE
                    AND first_support_timestamp IS NULL
                    THEN :authorTimestamp::VARCHAR
                ELSE first_support_timestamp::VARCHAR
            END,
            'chat_duration_in_seconds', '::NUMERIC',
            CASE
                WHEN
                    :isSupportMessage::BOOLEAN = TRUE
                    AND first_support_timestamp IS NULL
                    THEN 0::TEXT
                ELSE
                    ABS(
                        EXTRACT(
                            EPOCH FROM (
                                first_support_timestamp::TIMESTAMP WITH TIME ZONE
                                - :authorTimestamp::TIMESTAMP WITH TIME ZONE
                            )
                        )
                    )::TEXT
            END,
            'all_messages', '::TEXT[]',
            CASE
                WHEN :content::TEXT <> ''
                    THEN
                        CASE
                            WHEN all_messages IS NULL THEN ARRAY[:content]::TEXT []
                            ELSE (all_messages || :content)::TEXT []
                        END::TEXT
                ELSE all_messages::TEXT
            END
        ]::VARCHAR []
    )
FROM chat.denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;
