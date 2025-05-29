/*
declaration:
  version: 0.1
  description: "Create a new chat session with all related metadata and optional feedback"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: id
        type: string
        description: "Unique identifier for the chat session"
      - field: customerSupportId
        type: string
        description: "ID of the customer support agent"
      - field: customerSupportDisplayName
        type: string
        description: "Display name of the customer support agent"
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
        description: "Chat creation timestamp (or 'CURRENT_TIMESTAMP' for now)"
      - field: ended
        type: string
        description: "Chat end timestamp, may be null or 'CURRENT_TIMESTAMP'"
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
        description: "Optional feedback text provided by the end user"
      - field: feedbackRating
        type: integer
        description: "Optional numeric rating provided by the end user"
      - field: externalId
        type: string
        description: "External system ID related to the chat"
      - field: forwardedTo
        type: string
        description: "ID of the person/agent to whom the chat was forwarded"
      - field: forwardedToName
        type: string
        description: "Name of the person/agent to whom the chat was forwarded"
      - field: receivedFrom
        type: string
        description: "ID of the original sender of the chat"
      - field: receivedFromName
        type: string
        description: "Name of the original sender of the chat"
      - field: csaTitle
        type: string
        description: "Title of the customer support agent (nullable)"
  response:
    fields:
      - field: updated
        type: string
        description: "Text value returned to confirm that the chat was successfully created"
*/
INSERT INTO chat.chat (
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
    :id, :customerSupportId, :customerSupportDisplayName, :endUserId, :endUserFirstName,
    :endUserLastName, :status::CHAT_STATUS_TYPE,
    CASE
        WHEN :created::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
        ELSE COALESCE(:created::TIMESTAMP WITH TIME ZONE, NOW())
    END,
    (
        CASE
            WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()
            WHEN (:ended = '') THEN null WHEN (:ended = 'null') THEN NOW()
            ELSE :ended::TIMESTAMP WITH TIME ZONE
        END
    )::TIMESTAMP WITH TIME ZONE,
    :endUserEmail,
    :endUserPhone,
    :endUserOs,
    :endUserUrl,
    :feedbackText,
    (NULLIF(:feedbackRating::TEXT, '')::INTEGER),
    :externalId,
    :forwardedTo,
    :forwardedToName,
    :receivedFrom,
    :receivedFromName,
    (
        CASE
            WHEN (:csaTitle = 'null') THEN null WHEN (:csaTitle = '') THEN null ELSE
                :csaTitle
        END
    )
) RETURNING id, updated::TEXT;
