SELECT
    id,
    key,
    value
FROM configuration
WHERE key IN (
    'widgetProactiveSeconds',
    'widgetDisplayBubbleMessageSeconds',
    'widgetBubbleMessageText',
    'widgetColor',
    'isWidgetActive',
    'widgetAnimation',
    'is_burokratt_active'
)
AND id IN (
    SELECT MAX(id) FROM configuration
    GROUP BY key
)
AND NOT deleted;
