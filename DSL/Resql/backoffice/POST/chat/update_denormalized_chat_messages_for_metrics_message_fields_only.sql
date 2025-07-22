/*
declaration:
  version: 0.1
  description: "Insert a new message row into chat.denormalized_chat_messages_for_metrics based on latest chat state"
  method: post
  namespace: chat
  allowlist:
    body:
      - field: chatBaseId
        type: string
        description: "Base identifier of the chat"
      - field: content
        type: string
        description: "Message content (used to determine first message timestamp)"
      - field: lastMessageTimestamp
        type: string
        description: "Timestamp of the last message (CURRENT_TIMESTAMP, null, or specific timestamp)"
      - field: messageId
        type: string
        description: "Unique UUID of the message"
      - field: messageBaseId
        type: string
        description: "Base ID of the message"
      - field: messageCreated
        type: string
        description: "Timestamp when the message was created"
      - field: messageUpdated
        type: string
        description: "Timestamp when the message was last updated"
      - field: messageEvent
        type: string
        description: "Event type of the message"
        enum:
          - '',
          - 'inactive-chat-ended',
          - 'taken-over',
          - 'unavailable_organization_ask_contacts',
          - 'answered',
          - 'terminated',
          - 'chat_sent_to_csa_email',
          - 'client-left',
          - 'client_left_with_accepted',
          - 'client_left_with_no_resolution',
          - 'client_left_for_unknown_reasons',
          - 'accepted',
          - 'hate_speech',
          - 'other',
          - 'response_sent_to_client_email',
          - 'greeting',
          - 'requested-authentication',
          - 'authentication_successful',
          - 'authentication_failed',
          - 'ask-permission',
          - 'ask-permission-accepted',
          - 'ask-permission-rejected',
          - 'ask-permission-ignored',
          - 'ask_to_forward_to_csa',
          - 'forwarded_to_backoffice',
          - 'continue_chatting_with_bot',
          - 'rating',
          - 'redirected',
          - 'contact-information',
          - 'contact-information-rejected',
          - 'contact-information-fulfilled',
          - 'unavailable-contact-information-fulfilled',
          - 'contact-information-skipped',
          - 'requested-chat-forward',
          - 'requested-chat-forward-accepted',
          - 'requested-chat-forward-rejected',
          - 'unavailable_organization',
          - 'unavailable_csas',
          - 'unavailable_csas_ask_contacts',
          - 'unavailable_holiday',
          - 'pending-assigned',
          - 'user-reached',
          - 'user-not-reached',
          - 'user-authenticated',
          - 'message-read',
          - 'waiting_validation',
          - 'approved_validation',
          - 'not-confident'
      - field: messageAuthorRole
        type: string
        description: "Role of the message author"
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
      - field: messageAuthorId
        type: string
        description: "ID of the message author"
      - field: messageForwardedFromCsa
        type: string
        description: "CSA ID who forwarded the message"
      - field: messageForwardedToCsa
        type: string
        description: "CSA ID to whom the message was forwarded"
      - field: timestamp
        type: string
        description: "Explicit timestamp of the message (CURRENT_TIMESTAMP, null, or specific timestamp)"
  response:
    fields: []
*/
INSERT INTO chat.denormalized_chat_messages_for_metrics (
    chat_base_id,
    chat_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_text,
    feedback_rating,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    external_id,
    received_from,
    created,
    updated,
    ended,
    first_message_timestamp,
    last_message_timestamp,
    message_id,
    message_base_id,
    message_created,
    message_updated,
    message_event,
    message_author_role,
    message_author_id,
    message_forwarded_from_csa,
    message_forwarded_to_csa,
    timestamp
)
SELECT
    chat_base_id,
    chat_id,
    chat_status,
    end_user_email,
    end_user_phone,
    feedback_text,
    feedback_rating,
    customer_support_display_name,
    customer_support_id,
    customer_support_first_name,
    customer_support_last_name,
    external_id,
    received_from,
    created,
    updated,
    ended,
    CASE
        WHEN :content::TEXT <> '' AND first_message_timestamp IS NULL
            THEN
                CASE
                    WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
                    WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
                    WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()
                    ELSE :lastMessageTimestamp::TIMESTAMP WITH TIME ZONE
                END
        ELSE first_message_timestamp
    END,
    CASE
        WHEN :lastMessageTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :lastMessageTimestamp::TEXT = '' THEN NULL
        WHEN :lastMessageTimestamp::TEXT = 'null' THEN NOW()
        ELSE :lastMessageTimestamp::TIMESTAMP WITH TIME ZONE
    END,
    :messageId::UUID,
    :messageBaseId,
    CASE
        WHEN :messageCreated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :messageCreated::TEXT = '' THEN NULL
        WHEN :messageCreated::TEXT = 'null' THEN NOW()
        ELSE :messageCreated::TIMESTAMP WITH TIME ZONE
    END,
    CASE
        WHEN :messageUpdated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :messageUpdated::TEXT = '' THEN NULL
        WHEN :messageUpdated::TEXT = 'null' THEN NOW()
        ELSE :messageUpdated::TIMESTAMP WITH TIME ZONE
    END,
    LOWER(:messageEvent)::EVENT_TYPE,
    :messageAuthorRole::AUTHOR_ROLE_TYPE,
    :messageAuthorId::VARCHAR,
    :messageForwardedFromCsa::VARCHAR,
    :messageForwardedToCsa::VARCHAR,
    CASE
        WHEN :timestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        WHEN :timestamp::TEXT = '' THEN NULL
        WHEN :timestamp::TEXT = 'null' THEN NOW()
        ELSE :timestamp::TIMESTAMP WITH TIME ZONE
    END
FROM chat.denormalized_chat_messages_for_metrics
WHERE chat_base_id = :chatBaseId
ORDER BY timestamp DESC
LIMIT 1;
