/*
declaration:
  version: 0.1
  description: "Insert a new message into the chat with full author and forwarding metadata"
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
        description: "Optional message ID; if empty, a UUID is generated"
      - field: content
        type: string
        description: "Message content"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation']
        description: "Event type of the message"
      - field: authorTimestamp
        type: timestamp
        description: "Timestamp when the message was authored"
      - field: authorId
        type: string
        description: "ID of the message author"
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
        description: "Optional numeric rating associated with the message"
      - field: created
        type: timestamp
        description: "Timestamp when the message was created"
      - field: forwardedByUser
        type: string
        description: "ID of the user who forwarded the message"
      - field: forwardedFromCsa
        type: string
        description: "ID of the CSA from whom the message was forwarded"
      - field: forwardedToCsa
        type: string
        description: "ID of the CSA to whom the message was forwarded"
  response:
    fields:
      - field: updated
        type: string
        description: "Text indicating the update result of the insert operation"
*/
INSERT INTO message (
    chat_base_id,
    base_id,
    content,
    event,
    author_timestamp,
    author_id,
    author_first_name,
    author_last_name,
    author_role,
    rating,
    created,
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
    LOWER(:event)::event_type,
    :authorTimestamp::TIMESTAMP WITH TIME ZONE,
    :authorId,
    :authorFirstName,
    :authorLastName,
    :authorRole::author_role_type,
    (NULLIF(:rating, '')::INTEGER),
    :created::TIMESTAMP WITH TIME ZONE,
    :forwardedByUser,
    :forwardedFromCsa,
    :forwardedToCsa
) RETURNING id::TEXT, base_id, updated::TEXT
