WITH configuration_values AS (
    SELECT id, key, value
    FROM configuration
    WHERE (
        ("domain" = :domainUUID::UUID AND key IN (
            'widgetProactiveSeconds',
            'widgetDisplayBubbleMessageSeconds',
            'widgetBubbleMessageText',
            'widgetColor',
            'isWidgetActive',
            'widgetAnimation',
            'is_burokratt_active',
            'feedbackActive',
            'feedbackQuestion',
            'feedbackNoticeActive',
            'feedbackNotice',
            'isFiveRatingScale',
            'instantly_open_chat_widget',
            'show_sub_title',
            'sub_title'
        ))
        OR 
        ("domain" IS NULL AND key IN (
            'chat_active_duration',
            'show_idle_warning',
            'idle_message',
            'show_auto_close_text',
            'auto_close_text'
        ))
    )
    AND id IN (
        SELECT max(id) 
        FROM configuration 
        WHERE ("domain" = :domainUUID::UUID OR "domain" IS NULL)
          AND key IN (
            'widgetProactiveSeconds',
            'widgetDisplayBubbleMessageSeconds',
            'widgetBubbleMessageText',
            'widgetColor',
            'isWidgetActive',
            'widgetAnimation',
            'is_burokratt_active',
            'feedbackActive',
            'feedbackQuestion',
            'feedbackNoticeActive',
            'feedbackNotice',
            'isFiveRatingScale',
            'instantly_open_chat_widget',
            'show_sub_title',
            'sub_title',
            'chat_active_duration',
            'show_idle_warning',
            'idle_message',
            'show_auto_close_text',
            'auto_close_text'
        )
        GROUP BY key
    )
    AND NOT deleted
)
SELECT 
    MAX(CASE WHEN key = 'widgetProactiveSeconds' THEN value END) AS widget_proactive_seconds,
    MAX(CASE WHEN key = 'widgetDisplayBubbleMessageSeconds' THEN value END) AS widget_display_bubble_message_seconds,
    MAX(CASE WHEN key = 'widgetBubbleMessageText' THEN value END) AS widget_bubble_message_text,
    MAX(CASE WHEN key = 'widgetColor' THEN value END) AS widget_color,
    MAX(CASE WHEN key = 'isWidgetActive' THEN value END) AS is_widget_active,
    MAX(CASE WHEN key = 'widgetAnimation' THEN value END) AS widget_animation,
    MAX(CASE WHEN key = 'chat_active_duration' THEN value END) AS chat_active_duration,
    MAX(CASE WHEN key = 'show_idle_warning' THEN value END) AS show_idle_warning,
    MAX(CASE WHEN key = 'idle_message' THEN value END) AS idle_message,
    MAX(CASE WHEN key = 'show_auto_close_text' THEN value END) AS show_auto_close_text,
    MAX(CASE WHEN key = 'auto_close_text' THEN value END) AS auto_close_text,
    MAX(CASE WHEN key = 'is_burokratt_active' THEN value END) AS is_burokratt_active,
    MAX(CASE WHEN key = 'feedbackActive' THEN value END) AS feedback_active,
    MAX(CASE WHEN key = 'feedbackQuestion' THEN value END) AS feedback_question,
    MAX(CASE WHEN key = 'feedbackNoticeActive' THEN value END) AS feedback_notice_active,
    MAX(CASE WHEN key = 'feedbackNotice' THEN value END) AS feedback_notice,
    MAX(CASE WHEN key = 'isFiveRatingScale' THEN value END) AS is_five_rating_scale,
    MAX(CASE WHEN key = 'instantly_open_chat_widget' THEN value END) AS instantly_open_chat_widget,
    MAX(CASE WHEN key = 'show_sub_title' THEN value END) AS show_sub_title,
    MAX(CASE WHEN key = 'sub_title' THEN value END) AS sub_title
FROM configuration_values;
