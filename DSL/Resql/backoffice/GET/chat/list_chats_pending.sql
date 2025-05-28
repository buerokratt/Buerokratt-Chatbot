/*
declaration:
  version: 0.1
  description: "Fetch idle chats with metadata, ordered by creation time, optionally including the CSA title"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: is_csa_title_visible
        type: boolean
        description: "Flag indicating whether to include the CSA title in the response"
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
        description: "Current status of the chat (should be 'IDLE')"
      - field: created
        type: timestamp
        description: "Timestamp when the chat was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the chat was last updated"
      - field: ended
        type: timestamp
        description: "Timestamp when the chat ended, if applicable"
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
      - field: last_message
        type: string
        description: "Content of the last non-empty, non-forward, non-rating message"
      - field: contacts_message
        type: string
        description: "Contact-related message content"
      - field: last_message_timestamp
        type: timestamp
        description: "Timestamp of the last relevant message"
      - field: last_message_event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Type of the last event with non-empty message content"
      - field: csa_title
        type: string
        description: "Title of the customer support agent (included only if is_csa_title_visible is true)"
*/
WITH latest_idle_chats AS (
    SELECT DISTINCT ON (chat_id)
        chat_id,
        customer_support_id,
        customer_support_display_name,
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
        ended,
        forwarded_to,
        forwarded_to_name,
        received_from,
        received_from_name,
        external_id,
        CASE
            WHEN :is_csa_title_visible = 'true' THEN csa_title
            ELSE ''
        END AS csa_title,
        contacts_message,
        last_message_with_content_and_not_rating_or_forward,
        last_message_with_not_rating_or_forward_events_timestamp,
        last_non_empty_message_event
    FROM chat.denormalized_chat
    ORDER BY chat_id, denormalized_record_created DESC
)

SELECT
    c.chat_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    c.end_user_id,
    c.end_user_first_name,
    c.end_user_last_name,
    c.status,
    c.created,
    c.updated,
    c.ended,
    c.end_user_email,
    c.end_user_phone,
    c.end_user_os,
    c.end_user_url,
    c.external_id,
    c.forwarded_to,
    c.forwarded_to_name,
    c.received_from,
    c.received_from_name,
    last_message_with_content_and_not_rating_or_forward AS last_message,
    contacts_message,
    last_message_with_not_rating_or_forward_events_timestamp AS last_message_timestamp,
    last_non_empty_message_event AS last_message_event,
    csa_title
FROM latest_idle_chats AS c
WHERE status = 'IDLE'
ORDER BY c.created ASC
LIMIT :limit::INTEGER;
