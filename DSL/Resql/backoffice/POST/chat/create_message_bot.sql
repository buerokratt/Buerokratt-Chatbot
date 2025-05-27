/*
declaration:
  version: 0.1
  description: "Insert multiple messages into the chat from a JSON array, auto-generating message IDs and timestamps"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: messages
        type: array
        items:
          type: object
          properties:
            chatId:
              type: string
              description: "Unique identifier of the chat"
            content:
              type: string
              description: "Content of the message"
            buttons:
              type: string
              description: "Serialized buttons JSON (if any)"
            event:
              type: string
              enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
              description: "Type of event this message represents"
            authorId:
              type: string
              description: "ID of the author of the message"
            authorFirstName:
              type: string
              description: "First name of the author"
            authorLastName:
              type: string
              description: "Last name of the author"
  response:
    fields:
      - field: updated
        type: string
        description: "Text response confirming that messages were inserted"
*/
INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    buttons,
    event,
    author_timestamp,
    author_id,
    author_first_name,
    author_last_name, author_role, rating, created, updated
)
SELECT
    (SELECT value) ->> 'chatId' AS chat_base_id,
    (
        SELECT
            UUID_IN(
                MD5(
                    CONCAT(RANDOM()::TEXT, ((SELECT value) ->> 'content')::TEXT)
                )::CSTRING
            )
    ),
    (SELECT value) ->> 'content' AS content,
    (SELECT value) ->> 'buttons' AS buttons,
    ((SELECT value) ->> 'event')::event_type AS event,
    NOW() + ordinality * INTERVAL '1 microsecond',
    (SELECT value) ->> 'authorId' AS author_id,
    (SELECT value) ->> 'authorFirstName' AS author_first_name,
    (SELECT value) ->> 'authorLastName' AS author_last_name,
    'buerokratt'::author_role_type,
    null,
    NOW() + ordinality * INTERVAL '1 microsecond',
    NOW() + ordinality * INTERVAL '1 microsecond'
FROM JSON_ARRAY_ELEMENTS(ARRAY_TO_JSON(ARRAY[:messages])) WITH ORDINALITY
RETURNING id::TEXT, base_id::TEXT, updated::TEXT;
