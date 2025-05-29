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
WITH
    consts AS (
        SELECT
            E' ' AS regx_e_1,
            E'%' AS regx_e_2,
            'g' AS regx_e_3,
            E'(.*)' AS regx_e_4,
            E'%\\1%' AS regx_e_5
    ),

    regx AS (
        SELECT
            LOWER(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(

                        :searchKey,
                        consts.regx_e_1,
                        consts.regx_e_2,
                        consts.regx_e_3
                    ),
                    consts.regx_e_4,
                    consts.regx_e_5,
                    consts.regx_e_3
                )
            ) AS search_key
        FROM consts
    )

SELECT DISTINCT chat_id
FROM chat_history_comments
WHERE comment ILIKE (SELECT search_key FROM regx);
