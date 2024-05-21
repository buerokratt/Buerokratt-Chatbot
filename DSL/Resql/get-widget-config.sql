SELECT id, key, value
FROM configuration
WHERE key IN (
   'widgetProactiveSeconds',
   'widgetDisplayBubbleMessageSeconds',
   'widgetBubbleMessageText',
   'widgetColor',
   'isWidgetActive',
   'widgetAnimation')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND NOT deleted;
