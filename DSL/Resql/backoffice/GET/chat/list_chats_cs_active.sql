/*
declaration:
  version: 0.1
  description: "Fetch active chats excluding bot institution, returning the earliest created chats up to a specified limit, optionally including the CSA title"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: is_csa_title_visible
        type: boolean
        description: "Flag indicating whether to include the CSA title in the response"
      - field: bot_institution_id
        type: string
        description: "Identifier for the bot institution to exclude from results"
      - field: limit
        type: integer
        description: "Maximum number of chat records to return"
  response:
    fields:
      - field: id
        type: string
        description: "Chat's unique identifier"
      - field: customer_support_id
        type: string
        description: "Unique identifier for the customer support agent"
      - field: customer_support_display_name
        type: string
        description: "Display name of the customer support agent"
      - field: end_user_id
        type: string
        description: "Unique identifier for the end user"
      - field: end_user_first_name
        type: string
        description: "End user's first name"
      - field: end_user_last_name
        type: string
        description: "End user's last name"
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Current status of the chat"
      - field: created
        type: timestamp
        description: "Timestamp when the chat was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the chat was last updated"
      - field: ended
        type: timestamp
        description: "Timestamp when the chat ended (null if active)"
      - field: end_user_email
        type: string
        description: "End user's email address"
      - field: end_user_phone
        type: string
        description: "End user's phone number"
      - field: end_user_os
        type: string
        description: "End user's operating system"
      - field: end_user_url
        type: string
        description: "URL associated with the end user session"
      - field: external_id
        type: string
        description: "External identifier for the chat"
      - field: forwarded_to
        type: string
        description: "Identifier of the agent or queue the chat was forwarded to"
      - field: forwarded_to_name
        type: string
        description: "Display name of the agent or queue the chat was forwarded to"
      - field: received_from
        type: string
        description: "Identifier of the agent or queue that forwarded the chat"
      - field: received_from_name
        type: string
        description: "Display name of the agent or queue that forwarded the chat"
      - field: customer_messages
        type: integer
        description: "Count of messages sent by the customer"
      - field: last_message
        type: string
        description: "Content of the last non-rating, non-forward message with content"
      - field: contacts_message
        type: string
        description: "Contact-related message content"
      - field: last_message_timestamp
        type: timestamp
        description: "Timestamp of the last relevant message"
      - field: last_message_event_with_content
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Event type of the last message containing content"
      - field: csa_title
        type: string
        description: "Title of the customer support agent (included only if is_csa_title_visible is true)"
*/
WITH
    latest_chat_versions AS (
        -- Get the latest version of each chat with explicit columns
        SELECT DISTINCT ON (chat_id)
            chat_id,
            customer_support_id,
            customer_support_display_name,
            end_user_id,
            end_user_first_name,
            end_user_last_name,
            status,
            created,
            updated,
            ended,
            end_user_email,
            end_user_phone,
            end_user_os,
            end_user_url,
            external_id,
            forwarded_to,
            forwarded_to_name,
            received_from,
            received_from_name,
            customer_messages_count,
            last_message_with_content_and_not_rating_or_forward,
            contacts_message,
            last_message_with_not_rating_or_forward_events_timestamp,
            last_message_event_with_content,
            csa_title
        FROM denormalized_chat
        ORDER BY chat_id ASC, denormalized_record_created DESC
    )

SELECT
    chat_id AS id,
    customer_support_id,
    customer_support_display_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    status,
    created,
    updated,
    ended,
    end_user_email,
    end_user_phone,
    end_user_os,
    end_user_url,
    external_id,
    forwarded_to,
    forwarded_to_name,
    received_from,
    received_from_name,
    customer_messages_count AS customer_messages,
    last_message_with_content_and_not_rating_or_forward AS last_message,
    contacts_message,
    last_message_with_not_rating_or_forward_events_timestamp AS last_message_timestamp,
    last_message_event_with_content,
    CASE
        WHEN :is_csa_title_visible = 'true' THEN csa_title
        ELSE ''
    END AS csa_title

FROM latest_chat_versions
WHERE
    ended IS NULL
    AND customer_support_id <> :bot_institution_id
    AND status <> 'VALIDATING'
ORDER BY created ASC
LIMIT :limit::INTEGER;
