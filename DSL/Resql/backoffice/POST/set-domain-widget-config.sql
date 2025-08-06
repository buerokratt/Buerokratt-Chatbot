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
            ('widgetProactiveSeconds',       :widgetProactiveSeconds),
            ('widgetDisplayBubbleMessageSeconds',   :widgetDisplayBubbleMessageSeconds),
            ('widgetBubbleMessageText',     :widgetBubbleMessageText),
            ('widgetColor',  :widgetColor),
            ('isWidgetActive',  :isWidgetActive),
            ('widgetAnimation',  :widgetAnimation)
            ) AS v(key, value)
        RETURNING key, value, domain;