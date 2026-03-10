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
            ('anonymizer_selected_approach',       :anonymizer_selected_approach),
            ('anonymizer_selected_entities',   :anonymizer_selected_entities),
            ('anonymizer_allowlist',     :anonymizer_allowlist),
            ('anonymizer_denylist',  :anonymizer_denylist),
            ('is_anonymization_before_llm',  :is_anonymization_before_llm),
            ('is_anonymization_before_global_classifier',  :is_anonymization_before_global_classifier),
            ('record_conversations_anonymously',  :record_conversations_anonymously)
            ) AS v(key, value)
        RETURNING key, value, domain;
