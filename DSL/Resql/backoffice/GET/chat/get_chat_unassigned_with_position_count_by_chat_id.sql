/*
declaration:
  version: 0.1
  description: "Determine a chat’s position in the unassigned chat queue and the total number of unassigned chats"
  method: get
  namespace: chat
  allowlist:
    query:
      - field: chatId
        type: string
        description: "Chat ID to retrieve position for (optional)"
  response:
    fields:
      - field: position_in_unassigned_chats
        type: integer
        description: "Position of the specified chat in the unassigned queue (0 if none)"
      - field: unassigned_chat_total
        type: integer
        description: "Total number of unassigned chats"
*/
WITH
    unassigned_chats AS (
        SELECT
            base_id,
            ROW_NUMBER() OVER (
                ORDER BY created
            ) AS position
        FROM chat AS c1
        WHERE
            updated = (
                SELECT MAX(c2.updated) FROM chat AS c2
                WHERE c1.base_id = c2.base_id
            )
            AND ended IS NULL
            AND customer_support_id = ''
    )

SELECT
    (CASE
        WHEN :chatId IS NULL OR :chatId = ''
            THEN (SELECT 0)
        ELSE (
            SELECT position FROM unassigned_chats
            WHERE base_id = :chatId
        )
    END) AS position_in_unassigned_chats,
    (SELECT COUNT(base_id) FROM unassigned_chats) AS unassigned_chat_total
FROM unassigned_chats
LIMIT 1;
