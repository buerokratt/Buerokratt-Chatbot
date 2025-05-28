/*
declaration:
  version: 0.1
  description: "Create a new chat session, automatically assigning bot identity if bot is active in configuration"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: id
        type: string
        description: "Unique identifier for the chat session"
      - field: endUserId
        type: string
        description: "Unique identifier of the end user"
      - field: endUserFirstName
        type: string
        description: "First name of the end user"
      - field: endUserLastName
        type: string
        description: "Last name of the end user"
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Status of the chat session (cast to chat_status_type)"
      - field: created
        type: string
        description: "Chat creation timestamp (or 'CURRENT_TIMESTAMP')"
      - field: ended
        type: string
        description: "Chat end timestamp (may be null or 'CURRENT_TIMESTAMP')"
      - field: endUserEmail
        type: string
        description: "Email address of the end user"
      - field: endUserPhone
        type: string
        description: "Phone number of the end user"
      - field: endUserOs
        type: string
        description: "Operating system used by the end user"
      - field: endUserUrl
        type: string
        description: "URL visited by the end user during the chat"
      - field: feedbackText
        type: string
        description: "Optional feedback text from the end user"
      - field: feedbackRating
        type: integer
        description: "Optional feedback rating from the end user"
      - field: externalId
        type: string
        description: "External system ID related to the chat"
      - field: forwardedTo
        type: string
        description: "ID of the agent the chat was forwarded to"
      - field: forwardedToName
        type: string
        description: "Name of the agent the chat was forwarded to"
      - field: receivedFrom
        type: string
        description: "ID of the original sender of the chat"
      - field: receivedFromName
        type: string
        description: "Name of the original sender of the chat"
  response:
    fields:
      - field: customer_support_id
        type: string
        description: "ID of the customer support agent (or bot) assigned to the chat"
      - field: customer_support_display_name
        type: string
        description: "Display name of the assigned customer support agent or bot"
      - field: csa_title
        type: string
        description: "Title of the customer support agent (may be empty if assigned to bot)"
      - field: updated
        type: string
        description: "Confirmation text indicating the chat creation result"
*/

INSERT INTO chat (
    base_id,
    customer_support_id,
    customer_support_display_name,
    end_user_id,
    end_user_first_name,
    end_user_last_name,
    status,
    created,
    ended,
    end_user_email,
    end_user_phone,
    end_user_os,
    end_user_url,
    feedback_text,
    feedback_rating,
    external_id,
    forwarded_to,
    forwarded_to_name,
    received_from,
    received_from_name,
    csa_title
)
VALUES (
    :id,
    CASE
        WHEN :is_bot_active = 'true' THEN :bot_institution_id
        ELSE ''
    END,
    CASE
        WHEN :is_bot_active = 'true' THEN 'Bürokratt'
        ELSE ''
    END,
    :endUserId,
    :endUserFirstName,
    :endUserLastName,
    :status::chat_status_type,
    CASE 
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, now())
    END,
    (CASE
        WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN now()
        WHEN (:ended = '') THEN NULL
        WHEN (:ended = 'null') THEN NULL
        ELSE :ended::TIMESTAMP WITH TIME ZONE
    END)::TIMESTAMP WITH TIME ZONE,
    :endUserEmail,
    :endUserPhone,
    :endUserOs,
    :endUserUrl,
    :feedbackText,
    (NULLIF(:feedbackRating, '')::INTEGER),
    :externalId,
    :forwardedTo,
    :forwardedToName,
    :receivedFrom,
    :receivedFromName,
    CASE
      WHEN :is_bot_active = 'true' THEN ''
      ELSE ''
    END
)
RETURNING id, customer_support_id, customer_support_display_name, csa_title, updated::TEXT;
