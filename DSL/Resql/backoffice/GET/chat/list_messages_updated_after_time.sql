/*
declaration:
  version: 0.1
  description: "Fetch messages in a chat updated after a given timestamp, returning only the latest version per message"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: chatId
        type: string
        description: "Unique identifier for the chat"
      - field: timeRangeBegin
        type: timestamp
        description: "Lower bound timestamp; only messages updated after this will be returned"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier of the message (base_id)"
      - field: chat_id
        type: string
        description: "Base identifier of the chat"
      - field: content
        type: string
        description: "Message content"
      - field: buttons
        type: string
        description: "Serialized button payloads"
      - field: options
        type: string
        description: "Serialized options payloads"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Event type associated with the message"
      - field: author_id
        type: string
        description: "Identifier of the message author"
      - field: author_timestamp
        type: timestamp
        description: "Timestamp when the author sent the message"
      - field: author_first_name
        type: string
        description: "First name of the message author"
      - field: author_last_name
        type: string
        description: "Last name of the message author"
      - field: author_role
        type: string
        description: "Role of the message author (e.g., 'end_user', 'csa')"
      - field: forwarded_by_user
        type: boolean
        description: "Flag indicating if the message was forwarded by the end user"
      - field: forwarded_from_csa
        type: boolean
        description: "Flag indicating if the message was forwarded from a CSA"
      - field: forwarded_to_csa
        type: boolean
        description: "Flag indicating if the message was forwarded to a CSA"
      - field: rating
        type: integer
        description: "Rating associated with the message, if any"
      - field: created
        type: timestamp
        description: "Timestamp when the message was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the message was last updated"
*/
WITH
    latest_messages AS (
        SELECT DISTINCT ON (m.base_id)
            m.id,
            m.base_id,
            m.chat_base_id,
            m.content,
            m.buttons,
            m.options,
            m.event,
            m.author_id,
            m.author_timestamp,
            m.author_first_name,
            m.author_last_name,
            m.author_role,
            m.forwarded_by_user,
            m.forwarded_from_csa,
            m.forwarded_to_csa,
            m.rating,
            m.created,
            m.updated
        FROM chat.message AS m
        WHERE m.chat_base_id = :chatId
        ORDER BY m.base_id ASC, m.updated DESC
    )

SELECT
    lm.base_id AS id,
    lm.chat_base_id AS chat_id,
    lm.content,
    lm.buttons,
    lm.options,
    lm.event,
    lm.author_id,
    lm.author_timestamp,
    lm.author_first_name,
    lm.author_last_name,
    lm.author_role,
    lm.forwarded_by_user,
    lm.forwarded_from_csa,
    lm.forwarded_to_csa,
    lm.rating,
    lm.created,
    lm.updated
FROM latest_messages AS lm
WHERE :timeRangeBegin::TIMESTAMP WITH TIME ZONE < lm.updated
ORDER BY lm.created ASC;
