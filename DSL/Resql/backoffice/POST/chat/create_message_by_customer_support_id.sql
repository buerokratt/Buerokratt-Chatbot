/*
declaration:
  version: 0.1
  description: "Copy and update the most recent message of the active chat assigned to a given customer support agent"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: content
        type: string
        description: "New content to insert in the copied message"
      - field: event
        type: string
        enum: ['', 'inactive-chat-ended', 'taken-over', 'unavailable_organization_ask_contacts', 'answered', 'terminated', 'chat_sent_to_csa_email', 'client-left', 'client_left_with_accepted', 'client_left_with_no_resolution', 'client_left_for_unknown_reasons', 'accepted', 'hate_speech', 'other', 'response_sent_to_client_email', 'greeting', 'requested-authentication', 'authentication_successful', 'authentication_failed', 'ask-permission', 'ask-permission-accepted', 'ask-permission-rejected', 'ask-permission-ignored', 'ask_to_forward_to_csa', 'forwarded_to_backoffice', 'continue_chatting_with_bot', 'rating', 'redirected', 'contact-information', 'contact-information-rejected', 'contact-information-fulfilled', 'unavailable-contact-information-fulfilled', 'contact-information-skipped', 'requested-chat-forward', 'requested-chat-forward-accepted', 'requested-chat-forward-rejected', 'unavailable_organization', 'unavailable_csas', 'unavailable_csas_ask_contacts', 'unavailable_holiday', 'pending-assigned', 'user-reached', 'user-not-reached', 'user-authenticated', 'message-read', 'waiting_validation', 'approved_validation', 'not-confident']
        description: "Type of the event for the copied message"
      - field: authorId
        type: string
        description: "ID of the new author"
      - field: authorRole
        type: string
        enum: ['backoffice-user', 'end-user', 'Bürokratt', 'buerokratt']
        description: "Role of the new author"
      - field: customerSupportId
        type: string
        description: "ID of the customer support agent whose active chat is targeted"
  response:
    fields:
      - field: id
        type: integer
        description: "ID of the newly inserted copied message"
      - field: chat_base_id
        type: string
        description: "Base ID of the chat this message belongs to"
      - field: base_id
        type: string
        description: "New base ID generated for the copied message"
*/

SELECT copy_row_with_modifications(
    'chat.message',
    'id', '::UUID', id::VARCHAR,
    ARRAY[
        'content', '', :content,
        'event', '::event_type', :event,
        'author_id', '', :authorId,
        'author_role', '::author_role_type', :authorRole,
        'base_id', '', gen_random_uuid(),
        'created', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR,
        'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
    ]::VARCHAR[]
)::INTEGER as id, chat_base_id, base_id
FROM chat.message AS m1
WHERE
    chat_base_id IN (
        SELECT base_id
        FROM chat AS c1
        WHERE
            updated = (
                SELECT MAX(c2.updated) FROM chat c2
                WHERE c2.base_id = c1.base_id
            )
            AND customer_support_id = :customerSupportId
            AND ended IS null
    )
    AND id = (
        SELECT id FROM chat.message AS m2
        WHERE m1.chat_base_id = m2.chat_base_id
        ORDER BY updated DESC LIMIT 1
    );