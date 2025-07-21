/*
declaration:
  version: 0.1
  description: "Update the latest denormalized chat record with updated CSA, end-user, status, and metadata values"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Unique identifier of the chat"
      - field: customerSupportId
        type: string
        description: "ID of the assigned customer support agent"
      - field: customerSupportDisplayName
        type: string
        description: "Display name of the customer support agent (nullable)"
      - field: customerSupportFirstName
        type: string
        description: "First name of the customer support agent (nullable)"
      - field: customerSupportLastName
        type: string
        description: "Last name of the customer support agent (nullable)"
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Updated status of the chat"
      - field: ended
        type: timestamp
        description: "Time the chat was ended"
      - field: feedbackText
        type: string
        description: "Feedback text left by the user"
      - field: feedbackRating
        type: integer
        description: "Feedback rating left by the user"
      - field: externalId
        type: string
        description: "External system identifier for the chat"
      - field: forwardedTo
        type: string
        description: "ID of the agent the chat was forwarded to"
      - field: forwardedToName
        type: string
        description: "Name of the agent the chat was forwarded to"
      - field: receivedFrom
        type: string
        description: "ID from which the chat was received"
      - field: receivedFromName
        type: string
        description: "Name from which the chat was received"
      - field: endUserId
        type: string
        description: "ID of the end user"
      - field: endUserFirstName
        type: string
        description: "First name of the end user"
      - field: endUserLastName
        type: string
        description: "Last name of the end user"
      - field: endUserEmail
        type: string
        description: "Email address of the end user"
      - field: endUserPhone
        type: string
        description: "Phone number of the end user"
      - field: endUserOs
        type: string
        description: "Operating system of the end user"
      - field: endUserUrl
        type: string
        description: "Visited URL by the end user"
      - field: csaTitle
        type: string
        description: "Title of the customer support agent (nullable)"
      - field: updated
        type: timestamp
        description: "Timestamp when the chat was last updated"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp indicating when the new denormalized chat row was created"
*/
SELECT
    COPY_ROW_WITH_MODIFICATIONS(
        -- Table name for denormalized_chat
        'chat.denormalized_chat',
        'id', '::UUID', id::VARCHAR,                   -- ID column handling
        -- Direct array of modifications
        ARRAY[
            'chat_id', '', :chatId,
            'customer_support_id', '', :customerSupportId,
            'customer_support_display_name', '',
            CASE
                WHEN
                    :customerSupportDisplayName::TEXT = 'null'
                    AND :customerSupportId::TEXT = customer_support_id::TEXT
                    THEN customer_support_display_name
                WHEN :customerSupportDisplayName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportDisplayName
            END,
            'customer_support_first_name', '',
            CASE
                WHEN
                    :customerSupportFirstName::TEXT = 'null'
                    AND :customerSupportId::TEXT = customer_support_id::TEXT
                    THEN customer_support_first_name
                WHEN :customerSupportFirstName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportFirstName
            END,
            'customer_support_last_name', '',
            CASE
                WHEN
                    :customerSupportLastName::TEXT = 'null'
                    AND :customerSupportId::TEXT = customer_support_id::TEXT
                    THEN customer_support_last_name
                WHEN :customerSupportLastName::TEXT = 'null'
                    THEN NULL
                ELSE :customerSupportLastName
            END,
            'status', '::chat_status_type', :status,
            'ended', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :ended::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :ended::TEXT = '' THEN NULL
                WHEN :ended::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :ended::VARCHAR
            END,
            'feedback_text', '', :feedbackText,
            'feedback_rating', '::INTEGER', NULLIF(:feedbackRating::TEXT, ''),
            'external_id', '', :externalId,
            'forwarded_to', '', :forwardedTo,
            'forwarded_to_name', '', :forwardedToName,
            'received_from', '', :receivedFrom,
            'received_from_name', '', :receivedFromName,
            'end_user_id', '', :endUserId,
            'end_user_first_name', '', :endUserFirstName,
            'end_user_last_name', '', :endUserLastName,
            'end_user_email', '', :endUserEmail,
            'end_user_phone', '', :endUserPhone,
            'end_user_os', '', :endUserOs,
            'end_user_url', '', :endUserUrl,
            'csa_title', '',
            CASE
                WHEN :csaTitle::TEXT = 'null' THEN NULL
                WHEN :csaTitle::TEXT = '' THEN NULL
                ELSE :csaTitle::VARCHAR
            END,
            'updated', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END,
            'denormalized_record_created', '::TIMESTAMP WITH TIME ZONE',
            CASE
                WHEN :updated::TEXT = 'CURRENT_TIMESTAMP' THEN NOW()::VARCHAR
                WHEN :updated::TEXT = '' THEN NULL
                WHEN :updated::TEXT = 'null' THEN NOW()::VARCHAR
                ELSE :updated::VARCHAR
            END
        ]::VARCHAR []
    )
FROM chat.denormalized_chat
WHERE chat_id = :chatId
ORDER BY denormalized_record_created DESC
LIMIT 1;
