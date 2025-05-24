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
FROM chat.message
WHERE content ILIKE (SELECT search_key FROM regx);