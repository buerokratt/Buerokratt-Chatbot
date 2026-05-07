WITH domain_list AS (
    SELECT (jsonb_array_elements_text( :domains::jsonb ))::uuid AS domain
    )
INSERT INTO configuration (key, value, domain, created)
SELECT
    v.key,
    v.value,
    d.domain,
    NOW()
FROM
    domain_list AS d
        CROSS JOIN LATERAL (
        VALUES
            ('chat_analysis_enabled',              :chat_analysis_enabled),
            ('chat_analysis_theme',                :chat_analysis_theme),
            ('chat_analysis_byk_response_quality', :chat_analysis_byk_response_quality),
            ('chat_analysis_follow_up_action',     :chat_analysis_follow_up_action)
            ) AS v(key, value)
        RETURNING key, value, domain;
