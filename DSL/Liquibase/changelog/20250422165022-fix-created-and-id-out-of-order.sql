-- liquibase formatted sql
-- changeset Artsiom Beida:20250422165022 ignore:true

BEGIN TRANSACTION;
    -- 1. Create a temporary table to store the mapping of base_id to original_root_id
    CREATE TEMPORARY TABLE base_id_mapping AS
    WITH RECURSIVE message_chain AS (
        -- Start with messages that don't have an original_base_id (they are the roots of chains)
        SELECT base_id, base_id AS original_root_id, chat_base_id
        FROM message
        WHERE original_base_id IS NULL OR original_base_id = ''
        UNION ALL
        -- Recursively find all messages that reference a message in our chain
        SELECT m.base_id, mc.original_root_id, m.chat_base_id
        FROM message AS m
        JOIN message_chain AS mc ON m.original_base_id = mc.base_id AND m.chat_base_id = mc.chat_base_id
    )
    SELECT base_id, original_root_id, chat_base_id
    FROM message_chain
    WHERE base_id IN (
        -- Only include messages that are part of chains (either have original_base_id or are referenced)
        SELECT base_id FROM message WHERE original_base_id IS NOT NULL AND original_base_id != ''
        UNION
        SELECT DISTINCT original_base_id FROM message WHERE original_base_id IS NOT NULL AND original_base_id != ''
    );
    -- 2. Verify the mapping (optional but recommended before proceeding)
    -- SELECT * FROM base_id_mapping ORDER BY chat_base_id, original_root_id;
    -- 3. Update the base_id for all messages in chains to use their root base_id
    UPDATE message m
    SET base_id = bm.original_root_id, original_base_id = NULL
    FROM base_id_mapping AS bm
    WHERE m.base_id = bm.base_id
    AND m.chat_base_id = bm.chat_base_id
    AND m.base_id != bm.original_root_id;
    -- 4. Verify the update (optional but recommended)
    SELECT base_id, COUNT(*),
    MIN(created) AS first_created,
    MAX(updated) AS last_updated
    FROM message
    GROUP BY base_id
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC
    LIMIT 10;
    -- If everything looks good, commit the transaction
    DROP TABLE base_id_mapping;
COMMIT;
-- 5. Drop the original_base_id column
ALTER TABLE message DROP COLUMN original_base_id;


ALTER TABLE chat ALTER COLUMN created SET DEFAULT now();

ALTER TABLE message ALTER COLUMN created SET DEFAULT now();

ALTER TABLE message ALTER COLUMN author_timestamp SET DEFAULT now();

ALTER TABLE configuration ALTER COLUMN created SET DEFAULT now();

ALTER TABLE user_page_preferences ALTER COLUMN created SET DEFAULT now();

ALTER TABLE "user" ALTER COLUMN created SET DEFAULT now();

WITH min_updated AS (
    SELECT
        base_id,
        chat_base_id,
        MIN(updated) AS min_updated_timestamp
    FROM
        message
    GROUP BY
        base_id, chat_base_id
)
UPDATE message m
SET
    created = mu.min_updated_timestamp
FROM
    min_updated mu
WHERE
    m.base_id = mu.base_id
    AND m.chat_base_id = mu.chat_base_id;

UPDATE chat c
SET
  created = m.min_created
FROM (
  SELECT
    chat_base_id,
    MIN(created) AS min_created
  FROM message
  GROUP BY chat_base_id
) m
WHERE c.base_id = m.chat_base_id
  AND (c.created > m.min_created);

WITH first_row_by_base_id AS (
  SELECT
    base_id,
    MIN(id) AS min_id
  FROM chat
  GROUP BY base_id
)
UPDATE chat c
SET
  updated = created
FROM first_row_by_base_id f
WHERE c.base_id = f.base_id
  AND c.id = f.min_id;