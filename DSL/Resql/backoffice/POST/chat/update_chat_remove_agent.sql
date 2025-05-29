/*
declaration:
  version: 0.1
  description: "Unassign the customer support agent from the latest active chat version by clearing CSA fields"
  method: post
  accepts: json
  returns: json
  namespace: chat
  allowlist:
    body:
      - field: chatId
        type: string
        description: "Base ID of the chat from which the CSA should be unassigned"
  response:
    fields:
      - field: updated
        type: string
        description: "Timestamp when the CSA was unassigned and chat record updated"
*/
SELECT
    NOW()::TEXT AS updated,
    COPY_ROW_WITH_MODIFICATIONS(
        'chat',
        'id', '::UUID', id::VARCHAR,
        ARRAY[
            'customer_support_id', '', '',
            'customer_support_display_name', '', '',
            'csa_title', '', '',
            'updated', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR
        ]::VARCHAR []
    )
FROM chat
WHERE
    updated = (
        SELECT MAX(updated) FROM chat
        WHERE base_id = :chatId
    )
    AND base_id = :chatId
    AND ended IS null;
