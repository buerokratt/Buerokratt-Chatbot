/*
declaration:
  version: 0.1
  description: "Fetch the most recent forwarded messages referenced by a 'requested-chat-forward' event in a given chat"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: chatId
        type: string
        description: "Unique identifier for the chat"
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
        description: "Content of the message"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
        description: "Type of event associated with the message"
      - field: author_id
        type: string
        description: "Identifier of the message author"
      - field: author_timestamp
        type: timestamp
        description: "Timestamp when the message was authored"
      - field: author_first_name
        type: string
        description: "First name of the message author"
      - field: author_last_name
        type: string
        description: "Last name of the message author"
      - field: author_role
        type: string
        description: "Role of the message author"
      - field: rating
        type: integer
        description: "Rating associated with the message"
      - field: created
        type: timestamp
        description: "Timestamp when the message was created"
      - field: forwarded_by_user
        type: string
        description: "Whether the message was forwarded by the end user"
      - field: forwarded_from_csa
        type: string
        description: "Whether the message was forwarded from a CSA"
      - field: forwarded_to_csa
        type: string
        description: "Whether the message was forwarded to a CSA"
      - field: updated
        type: timestamp
        description: "Timestamp when the message was last updated"
*/
SELECT
    chat_base_id,
    base_id,
    content,
    event,
    author_id,
    author_timestamp,
    author_first_name,
    author_last_name,
    author_role,
    rating,
    created,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa,
    updated
FROM message AS m1
WHERE base_id = ANY(ARRAY(
    SELECT content::VARCHAR [] AS message_ids
    FROM message
    WHERE
        chat_base_id = :chatId
        AND event = 'requested-chat-forward'
    ORDER BY updated DESC
    LIMIT 1
))
AND updated = (
    SELECT MAX(m2.updated) FROM message AS m2
    WHERE chat_base_id = :chatId and m1.base_id = m2.base_id
);
