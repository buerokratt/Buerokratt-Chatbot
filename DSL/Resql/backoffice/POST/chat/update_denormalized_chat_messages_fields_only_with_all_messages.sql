/*
declaration:
  version: 0.1
  description: "Update the latest denormalized chat record with new message metadata and append to all_messages array"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Chat ID for which the denormalized record should be updated"
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
      - field: isSupportMessage
        type: boolean
        description: "True if the message is from support"
      - field: authorTimestamp
        type: timestamp
        description: "Timestamp when the message was authored"
      - field: messages
        type: array
        items:
          type: string
        description: "Array of new message contents to append to all_messages"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the message-related fields were updated"
*/
-- Using array approach directly
SELECT copy_row_with_modifications(
    'chat.denormalized_chat',                              -- Table name for denormalized_chat
    'id', '::UUID', id::VARCHAR,                   -- ID column handling
    ARRAY[                                            -- Direct array of modifications
        'chat_id', '', :chatId,
        'last_message_author_id', '', :lastMessageAuthorId,
        'last_message_event', '::event_type', LOWER(:lastMessageEvent),
        'last_message_including_empty_content', '', :content,
        'last_non_empty_message_event', '::event_type', 
            CASE
                WHEN :lastMessageEvent::TEXT = '' THEN last_non_empty_message_event::VARCHAR
                ELSE LOWER(:lastMessageEvent)
            END,
        'last_message_event_with_content', '::event_type', 
            CASE
                WHEN :content::TEXT = '' THEN last_message_event_with_content::VARCHAR
                ELSE LOWER(:lastMessageEvent)
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
        'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE', 
            CASE
                WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :lastMessageTimestamp::VARCHAR
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
                WHEN all_messages IS NULL THEN ARRAY[:messages]::TEXT[]
                ELSE (all_messages || ARRAY[:messages])::TEXT[]
            END::TEXT
    ]::VARCHAR[]
)
FROM chat.denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;