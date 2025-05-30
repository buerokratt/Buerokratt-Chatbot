/*
declaration:
  version: 0.1
  description: "Fetch the most recent chat by chat ID, optionally including the CSA title"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: id
        type: string
        description: "Unique identifier for the chat"
      - field: is_csa_title_visible
        type: boolean
        description: "Flag indicating whether to include the CSA title in the response"
  response:
    fields:
      - field: id
        type: string
        description: "Chat's unique identifier"
      - field: customer_support_id
        type: string
        description: "Unique identifier for the customer support agent"
      - field: customer_support_display_name
        type: string
        description: "Display name of the customer support agent"
      - field: end_user_id
        type: string
        description: "Unique identifier for the end user"
      - field: end_user_first_name
        type: string
        description: "End user's first name"
      - field: end_user_last_name
        type: string
        description: "End user's last name"
      - field: status
        type: string
        enum: ['ENDED', 'OPEN', 'REDIRECTED', 'IDLE', 'VALIDATING']
        description: "Current status of the chat"
      - field: feedback_text
        type: string
        description: "Feedback text provided by the end user"
      - field: feedback_rating
        type: integer
        description: "Feedback rating provided by the end user"
      - field: end_user_email
        type: string
        description: "End user's email address"
      - field: end_user_phone
        type: string
        description: "End user's phone number"
      - field: end_user_os
        type: string
        description: "End user's operating system"
      - field: end_user_url
        type: string
        description: "URL associated with the end user session"
      - field: created
        type: timestamp
        description: "Timestamp when the chat was created"
      - field: updated
        type: timestamp
        description: "Timestamp when the chat was last updated"
      - field: ended
        type: timestamp
        description: "Timestamp when the chat ended"
      - field: external_id
        type: string
        description: "External identifier for the chat"
      - field: received_from
        type: string
        description: "Identifier of the agent or queue that forwarded the chat"
      - field: received_from_name
        type: string
        description: "Display name of the agent or queue that forwarded the chat"
      - field: forwarded_to
        type: string
        description: "Identifier of the agent or queue the chat was forwarded to"
      - field: forwarded_to_name
        type: string
        description: "Display name of the agent or queue the chat was forwarded to"
      - field: last_message_including_empty_content
        type: string
        description: "Content of the last message, even if empty"
      - field: last_message_timestamp
        type: timestamp
        description: "Timestamp of the last message"
      - field: csa_title
        type: string
        description: "Title of the customer support agent (included only if is_csa_title_visible is true)"
*/
SELECT
    c.chat_id AS id,
    c.customer_support_id,
    c.customer_support_display_name,
    c.end_user_id,
    c.end_user_first_name,
    c.end_user_last_name,
    c.status,
    c.feedback_text,
    c.feedback_rating,
    c.end_user_email,
    c.end_user_phone,
    c.end_user_os,
    c.end_user_url,
    c.created,
    c.updated,
    c.ended,
    c.external_id,
    c.received_from,
    c.received_from_name,
    c.forwarded_to_name,
    c.forwarded_to,
    c.last_message_including_empty_content,
    c.last_message_timestamp,
    CASE
        WHEN :is_csa_title_visible = 'true' THEN c.csa_title
        ELSE ''
    END AS csa_title
FROM denormalized_chat AS c
WHERE c.chat_id = :id
ORDER BY c.denormalized_record_created DESC
LIMIT 1;
