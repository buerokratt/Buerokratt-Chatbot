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
FROM denormalized_chat
WHERE 
    LOWER(first_message) LIKE (SELECT search_key FROM regx)
    OR LOWER(last_message) LIKE (SELECT search_key FROM regx)
    OR LOWER(chat_id) LIKE (SELECT search_key FROM regx)
    OR LOWER(customer_support_display_name) LIKE (SELECT search_key FROM regx)
    OR LOWER(end_user_first_name) LIKE (SELECT search_key FROM regx)
    OR LOWER(end_user_last_name) LIKE (SELECT search_key FROM regx)
    OR LOWER(end_user_id) LIKE (SELECT search_key FROM regx)
    OR LOWER(end_user_email) LIKE (SELECT search_key FROM regx)
    OR LOWER(end_user_phone) LIKE (SELECT search_key FROM regx)
    OR LOWER(end_user_url) LIKE (SELECT search_key FROM regx)
    OR LOWER(comment) LIKE (SELECT search_key FROM regx);
