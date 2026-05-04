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
            ('is_bot_active',       :is_bot_active),
            ('is_burokratt_active',   :is_burokratt_active),
            ('is_csa_name_visible',     :is_csa_name_visible),
            ('is_csa_title_visible',  :is_csa_title_visible),
            ('is_edit_chat_visible',  :is_edit_chat_visible),
            ('instantly_open_chat_widget',  :instantly_open_chat_widget),
            ('show_sub_title',  :show_sub_title),
            ('sub_title',  :sub_title),
            ('response_waiting_time', :response_waiting_time),
            ('response_processing_notice', :response_processing_notice)
            ) AS v(key, value)
        RETURNING key, value, domain;
