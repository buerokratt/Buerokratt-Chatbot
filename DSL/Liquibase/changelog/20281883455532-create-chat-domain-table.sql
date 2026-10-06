-- liquibase formatted sql
-- changeset 1AhmedYasser:20281883455532
CREATE TABLE chat_domain (
    chat_base_id VARCHAR(36) PRIMARY KEY,
    domain TEXT NOT NULL,
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO chat_domain (chat_base_id, domain)
SELECT DISTINCT ON (c.base_id) c.base_id, d.url
FROM chat c
JOIN (
    SELECT DISTINCT url, rtrim(url, '/') AS base_url
    FROM widget_domains
    WHERE rtrim(url, '/') <> ''
) d
    ON c.end_user_url = d.url
    OR c.end_user_url = d.base_url
    OR c.end_user_url LIKE d.base_url || '/%'
    OR c.end_user_url LIKE d.base_url || '?%'
    OR c.end_user_url LIKE d.base_url || '#%'
WHERE c.base_id IS NOT NULL
ORDER BY c.base_id, length(d.url) DESC
ON CONFLICT (chat_base_id) DO NOTHING;
