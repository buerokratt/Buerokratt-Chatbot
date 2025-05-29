/*
declaration:
  version: 0.1
  description: "Fetch distinct customer support agent IDs for a given chat"
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
      - field: customer_support_id
        type: string
        description: "Unique identifier(s) of the customer support agent(s) associated with the chat"
*/
SELECT DISTINCT customer_support_id
FROM chat
WHERE
    base_id = :chatId AND customer_support_id <> '' AND customer_support_id IS NOT NULL;
