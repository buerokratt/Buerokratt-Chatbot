WITH domain_list AS (
    SELECT (jsonb_array_elements_text( :domains::jsonb ))::uuid AS domain
    )
INSERT INTO configuration (key, value, domain, created)
SELECT
    v.key,
    v.value,
    d.domain,
    :created::timestamptz
FROM
    domain_list AS d
        CROSS JOIN LATERAL (
        VALUES
            ('is_greeting_message_active',       :isActive),
            ('greeting_message_est',   :message)
            ) AS v(key, value)
        RETURNING key, value, domain;