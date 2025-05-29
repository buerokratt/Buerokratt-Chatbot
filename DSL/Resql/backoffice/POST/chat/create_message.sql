/*
declaration:
  version: 0.1
  description: "Insert a new message into the chat, including metadata such as author, event type, and optional forwarding or rating info"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Unique identifier of the chat to which the message belongs"
      - field: messageId
        type: string
        description: "Optional unique identifier for the message; generated if not provided"
      - field: content
        type: string
        description: "Message content"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Event type of the message"
      - field: authorTimestamp
        type: timestamp
        description: "Timestamp when the message was authored"
      - field: created
        type: timestamp
        description: "Timestamp when the message was stored"
      - field: authorId
        type: string
        description: "Identifier of the author of the message"
      - field: authorFirstName
        type: string
        description: "First name of the message author"
      - field: authorLastName
        type: string
        description: "Last name of the message author"
      - field: authorRole
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the author (cast to author_role_type)"
      - field: rating
        type: integer
        description: "Optional rating value associated with the message"
      - field: forwardedByUser
        type: string
        description: "ID of the user who forwarded the message, if applicable"
      - field: forwardedFromCsa
        type: string
        description: "ID of the customer support agent from whom the message was forwarded"
      - field: forwardedToCsa
        type: string
        description: "ID of the customer support agent to whom the message was forwarded"
  response:
    fields:
      - field: updated
        type: string
        description: "Text response confirming that the message was inserted"
*/
INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    event,
    author_timestamp,
    created,
    author_id,
    author_first_name,
    author_last_name,
    author_role,
    rating,
    forwarded_by_user,
    forwarded_from_csa,
    forwarded_to_csa
)
VALUES (
    :chatId,
    (CASE
        WHEN :messageId IS NOT NULL AND :messageId <> '' THEN :messageId
        ELSE (GEN_RANDOM_UUID()::VARCHAR)
    END),
    :content,
    LOWER(:event)::EVENT_TYPE,
    CASE
        WHEN :authorTimestamp::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        ELSE COALESCE(:authorTimestamp::TIMESTAMP WITH TIME ZONE, NOW())
    END,
    CASE
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, NOW())
    END,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole::AUTHOR_ROLE_TYPE,
    (NULLIF(:rating, '')::INTEGER),
    :forwardedByUser,
    :forwardedFromCsa,
    :forwardedToCsa
) RETURNING id::TEXT, base_id, updated::TEXT;
