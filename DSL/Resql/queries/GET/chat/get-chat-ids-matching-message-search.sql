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
    ),

filtered_messages AS (
        SELECT message.chat_base_id AS chat_id
        FROM message
            LEFT JOIN chat ON message.chat_base_id = chat.base_id
            LEFT JOIN
                chat_history_comments
                ON message.chat_base_id = chat_history_comments.chat_id
            INNER JOIN regx ON (
                LOWER(content) LIKE regx.search_key
                OR LOWER(chat_base_id) LIKE regx.search_key
                OR LOWER(chat.customer_support_display_name) LIKE regx.search_key
                OR LOWER(chat.end_user_first_name) LIKE regx.search_key
                OR LOWER(chat.end_user_last_name) LIKE regx.search_key
                OR LOWER(chat.end_user_id) LIKE regx.search_key
                OR LOWER(chat.end_user_email) LIKE regx.search_key
                OR LOWER(chat.end_user_phone) LIKE regx.search_key
                OR LOWER(chat.end_user_url) LIKE regx.search_key
                OR LOWER(chat_history_comments.comment) LIKE regx.search_key
            )
    )

SELECT chat_id
FROM filtered_messages
GROUP BY chat_id;
