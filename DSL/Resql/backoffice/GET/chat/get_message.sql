/*
declaration:
  version: 0.1
  description: "Fetch the most recent message by base ID"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Unique identifier for the message base"
  response:
    fields:
      - field: chat_base_id
        type: string
        description: "Base identifier of the chat"
      - field: base_id
        type: string
        description: "Unique identifier for the message"
      - field: content
        type: string
        description: "Message content"
      - field: buttons
        type: string
        description: "Serialized button payloads"
      - field: options
        type: string
        description: "Serialized option payloads"
      - field: author_id
        type: string
        description: "Unique identifier for the message author"
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
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the message author"
      - field: forwarded_by_user
        type: string
        description: "Flag indicating if the message was forwarded by the end user"
      - field: forwarded_from_csa
        type: string
        description: "Flag indicating if the message was forwarded from a CSA"
      - field: forwarded_to_csa
        type: string
        description: "Flag indicating if the message was forwarded to a CSA"
      - field: created
        type: timestamp
        description: "Timestamp when the message record was created"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Type of event associated with the message"
      - field: rating
        type: integer
        description: "Rating associated with the message, if any"
*/
SELECT
    chat_base_id,
    base_id,
    content,
    buttons,
    options,
    author_id,
    author_timestamp,
    author_first_name,
    author_last_name,
    author_role,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa,
    created,
    event,
    rating
FROM chat.message
WHERE base_id = :id
ORDER BY updated DESC
LIMIT 1
