/*
declaration:
  version: 0.1
  description: "Fetch chats with specific last message events indicating unavailability, within a date range, optionally including the CSA title"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: is_csa_title_visible
        type: boolean
        description: "Flag indicating whether to include the CSA title in the response"
      - field: start
        type: date
        description: "Start date for filtering chats by creation date"
      - field: end
        type: date
        description: "End date for filtering chats by creation date"
      - field: limit
        type: integer
        description: "Maximum number of results to return"
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
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Final status of the chat"
      - field: created
        type: timestamp
        description: "Timestamp of the first message"
      - field: updated
        type: timestamp
        description: "Timestamp when the chat record was last updated"
      - field: ended
        type: timestamp
        description: "Timestamp when the chat ended"
      - field: forwarded_to_name
        type: string
        description: "Name of the entity the chat was forwarded to"
      - field: received_from
        type: string
        description: "Identifier of who forwarded the chat"
      - field: labels
        type: string
        description: "Labels associated with the chat"
      - field: comment
        type: string
        description: "Comment added to the chat"
      - field: last_message
        type: string
        description: "Content of the last message"
      - field: last_message_event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
        description: "Type of the last event message, filtered to unavailability reasons"
      - field: contacts_message
        type: string
        description: "Contact-related message content"
      - field: last_message_timestamp
        type: timestamp
        description: "Timestamp of the last message"
      - field: csa_title
        type: string
        description: "Title of the customer support agent (included only if is_csa_title_visible is true)"
*/
SELECT
    chat_id AS id,
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
    first_message_timestamp AS created,
    updated,
    ended,
    forwarded_to_name,
    received_from,
    labels,
    comment,
    last_message,
    last_message_event,
    contacts_message,
    last_message_timestamp,
    csa_title
FROM (
    SELECT
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
        first_message_timestamp,
        updated,
        ended,
        forwarded_to_name,
        received_from,
        labels,
        comment,
        last_message,
        contacts_message,
        last_message_timestamp,
        CASE
            WHEN :is_csa_title_visible = 'true' THEN csa_title
            ELSE ''
        END AS csa_title,
        last_message_event AS last_message_event,
        created,
        ROW_NUMBER() OVER (PARTITION BY chat_id ORDER BY denormalized_record_created DESC) as rn
    FROM denormalized_chat
) AS subquery
WHERE rn = 1
  AND created::DATE BETWEEN :start::date AND :end::date
  AND ended IS NOT NULL
  AND last_message_event IN (
      'unavailable_holiday',
      'unavailable-contact-information-fulfilled',
      'contact-information-skipped',
      'unavailable_organization',
      'unavailable_csas',
      'unavailable_csas_ask_contacts'
  )
ORDER BY created ASC 
LIMIT :limit;
