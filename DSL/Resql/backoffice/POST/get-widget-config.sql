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
                  'chat_active_duration',
                  'show_idle_warning',
                  'idle_message',
                  'show_auto_close_text',
                  'auto_close_text',
                  'is_burokratt_active',
                  'feedbackActive',
                  'feedbackQuestion',
                  'feedbackNoticeActive',
                  'feedbackNotice',
                  'isFiveRatingScale',
                  'instantly_open_chat_widget',
                  'show_sub_title',
                  'sub_title',
                  'response_waiting_time',
                  'response_processing_notice'
                  )
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    COALESCE(MAX(CASE WHEN KEY = 'widgetProactiveSeconds' THEN value END), '2') AS widget_proactive_seconds,
    COALESCE(MAX(CASE WHEN KEY = 'widgetDisplayBubbleMessageSeconds' THEN value END), '2') AS widget_display_bubble_message_seconds,
    COALESCE(MAX(CASE WHEN KEY = 'widgetBubbleMessageText' THEN value END), '') AS widget_bubble_message_text,
    COALESCE(MAX(CASE WHEN KEY = 'widgetColor' THEN value END), '#27ff00') AS widget_color,
    COALESCE(MAX(CASE WHEN KEY = 'isWidgetActive' THEN value END), 'false') AS is_widget_active,
    COALESCE(MAX(CASE WHEN KEY = 'widgetAnimation' THEN value END), 'shockwave') AS widget_animation,
    COALESCE(MAX(CASE WHEN KEY = 'chat_active_duration' THEN value END), '') AS chat_active_duration,
    COALESCE(MAX(CASE WHEN KEY = 'show_idle_warning' THEN value END), 'false') AS show_idle_warning,
    COALESCE(MAX(CASE WHEN KEY = 'idle_message' THEN value END), '') AS idle_message,
    COALESCE(MAX(CASE WHEN KEY = 'show_auto_close_text' THEN value END), 'false') AS show_auto_close_text,
    COALESCE(MAX(CASE WHEN KEY = 'auto_close_text' THEN value END), '') AS auto_close_text,
    COALESCE(MAX(CASE WHEN KEY = 'is_burokratt_active' THEN value END), 'false') AS is_burokratt_active,
    COALESCE(MAX(CASE WHEN KEY = 'feedbackActive' THEN value END), 'false') AS feedback_active,
    COALESCE(MAX(CASE WHEN KEY = 'feedbackQuestion' THEN value END), '') AS feedback_question,
    COALESCE(MAX(CASE WHEN KEY = 'feedbackNoticeActive' THEN value END), 'false') AS feedback_notice_active,
    COALESCE(MAX(CASE WHEN KEY = 'feedbackNotice' THEN value END), '') AS feedback_notice,
    COALESCE(MAX(CASE WHEN KEY = 'isFiveRatingScale' THEN value END), 'false') AS is_five_rating_scale,
    COALESCE(MAX(CASE WHEN KEY = 'instantly_open_chat_widget' THEN value END), 'false') AS instantly_open_chat_widget,
    COALESCE(MAX(CASE WHEN KEY = 'show_sub_title' THEN value END), 'false') AS show_sub_title,
    COALESCE(MAX(CASE WHEN KEY = 'sub_title' THEN value END), '') AS sub_title,
    COALESCE(MAX(CASE WHEN KEY = 'response_waiting_time' THEN value END), '10') AS response_waiting_time,
    COALESCE(MAX(CASE WHEN KEY = 'response_processing_notice' THEN value END), '') AS response_processing_notice
FROM configuration_values;
