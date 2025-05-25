/*
declaration:
  version: 0.1
  description: "Search messages by content and return matching chat IDs"
  method: get
  namespace: chat
  allowlist:
    query:
      - field: searchKey
        type: string
        description: "Keyword or phrase to search within message content"
  response:
    fields:
      - field: chat_id
        type: string
        description: "Unique identifier of the chat that contains the matching message"
*/
WITH consts AS (
  SELECT E' ' AS regxE1,
         E'%' AS regxE2,
         'g' AS regxE3,
         E'(.*)' AS regxE4,
         E'%\\1%' AS regxE5
), regx AS (
  SELECT lower(regexp_replace(regexp_replace(:searchKey, consts.regxE1, consts.regxE2, consts.regxE3), consts.regxE4, consts.regxE5, consts.regxE3)) AS search_key
  FROM consts
)
SELECT DISTINCT chat_base_id AS chat_id
FROM message
WHERE content ILIKE (SELECT search_key FROM regx);