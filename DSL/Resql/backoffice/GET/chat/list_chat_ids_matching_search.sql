/*
declaration:
  version: 0.1
  description: "Search chats by matching various fields against a keyword and return matching chat IDs"
  method: get
  namespace: chat
  allowlist:
    query:
      - field: searchKey
        type: string
        description: "Keyword or phrase to search across chat fields"
  response:
    fields:
      - field: chat_id
        type: string
        description: "Unique identifier of chats matching the search criteria"
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

SELECT DISTINCT base_id as chat_id
FROM chat
WHERE 
    base_id ILIKE (SELECT search_key FROM regx)
    OR customer_support_display_name ILIKE (SELECT search_key FROM regx)
    OR end_user_first_name ILIKE (SELECT search_key FROM regx)
    OR end_user_last_name ILIKE (SELECT search_key FROM regx)
    OR end_user_id ILIKE (SELECT search_key FROM regx)
    OR end_user_email ILIKE (SELECT search_key FROM regx)
    OR end_user_phone ILIKE (SELECT search_key FROM regx)
    OR end_user_url ILIKE (SELECT search_key FROM regx);
