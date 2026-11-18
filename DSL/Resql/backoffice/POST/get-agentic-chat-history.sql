WITH RECURSIVE MessageChain AS (
    SELECT m.*
    FROM message m
    WHERE m.chat_base_id = :chatId
    UNION ALL
    SELECT m.*
    FROM message m
    INNER JOIN MessageChain mc ON m.original_base_id = mc.base_id
),
FilteredMessages AS (
    SELECT DISTINCT ON (mc.base_id) mc.*
    FROM MessageChain mc
    LEFT JOIN MessageChain mc2 ON mc.base_id = mc2.original_base_id
    WHERE mc2.base_id IS NULL
),
CleanedMessages AS (
    SELECT
        fm.id,
        fm.created,
        CASE WHEN fm.author_role = 'end-user' THEN 'user' ELSE 'assistant' END AS role,
        CASE
            WHEN fm.author_role = 'end-user' THEN btrim(fm.content)
            ELSE btrim(
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(fm.content, '\s*\n\s*Viited:\s*\n.*$', ''),
                            '【[^】]*】', '', 'g'
                        ),
                        '[ \t]*\[doc\d+\]', '', 'g'
                    ),
                    '[ \t]*⁽[⁰¹²³⁴⁵⁶⁷⁸⁹]+⁾', '', 'g'
                )
            )
        END AS content
    FROM FilteredMessages fm
    WHERE fm.event IS NULL OR fm.event <> 'greeting'
),
History AS (
    SELECT *
    FROM (
        SELECT cm.*, ROW_NUMBER() OVER (ORDER BY cm.created DESC, cm.id DESC) AS recency
        FROM CleanedMessages cm
        WHERE cm.content IS NOT NULL AND cm.content <> ''
    ) ranked
    WHERE ranked.recency > 1
),
Turns AS (
    SELECT
        h.*,
        COUNT(*) FILTER (WHERE h.role = 'user') OVER (ORDER BY h.created, h.id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS turn,
        COUNT(*) FILTER (WHERE h.role = 'user') OVER () AS total_turns
    FROM History h
)
SELECT role, content
FROM Turns
WHERE turn > 0
  AND (:maxPairs::integer <= 0 OR turn > total_turns - :maxPairs::integer)
ORDER BY created, id;
