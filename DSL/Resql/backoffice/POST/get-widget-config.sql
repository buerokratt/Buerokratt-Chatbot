WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('widgetProactiveSeconds', 
                  'widgetDisplayBubbleMessageSeconds', 
                  'widgetBubbleMessageText',
                  'widgetColor',
                  'isWidgetActive',
                  'widgetAnimation',
                  'is_burokratt_active',
                  'feedbackActive', 
                  'feedbackQuestion', 
                  'feedbackNoticeActive',
                  'feedbackNotice')
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'widgetProactiveSeconds' THEN value END) AS widget_proactive_seconds,
    MAX(CASE WHEN KEY = 'widgetDisplayBubbleMessageSeconds' THEN value END) AS widget_display_bubble_message_seconds,
    MAX(CASE WHEN KEY = 'widgetBubbleMessageText' THEN value END) AS widget_bubble_message_text,
    MAX(CASE WHEN KEY = 'widgetColor' THEN value END) AS widget_color,
    MAX(CASE WHEN KEY = 'isWidgetActive' THEN value END) AS is_widget_active,
    MAX(CASE WHEN KEY = 'widgetAnimation' THEN value END) AS widget_animation,
    MAX(CASE WHEN KEY = 'is_burokratt_active' THEN value END) AS is_burokratt_active,
    MAX(CASE WHEN KEY = 'feedbackActive' THEN value END) AS feedback_active,
    MAX(CASE WHEN KEY = 'feedbackQuestion' THEN value END) AS feedback_question,
    MAX(CASE WHEN KEY = 'feedbackNoticeActive' THEN value END) AS feedback_notice_active,
    MAX(CASE WHEN KEY = 'feedbackNotice' THEN value END) AS feedback_notice
FROM configuration_values;
