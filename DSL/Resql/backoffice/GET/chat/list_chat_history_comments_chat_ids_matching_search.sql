/*
declaration:
  version: 0.1
  description: "Search chat history comments for a keyword and return matching chat IDs"
  method: get
  namespace: chat
  returns: json
  allowlist:
    query:
      - field: searchKey
        type: string
        description: "Keyword or phrase to search within comments"
  response:
    fields:
      - field: chat_id
        type: string
        description: "Unique identifier of chats containing the search term in comments"
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
SELECT DISTINCT chat_id
FROM chat.chat_history_comments
WHERE comment ILIKE (SELECT search_key FROM regx);