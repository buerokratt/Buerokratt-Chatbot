SELECT *
FROM configuration
WHERE (key = 'widgetProactiveSeconds'
    OR key = 'widgetDisplayBubbleMessageSeconds'
    OR key = 'widgetBubbleMessageText'
    OR key = 'widgetColor'
    OR key = 'isWidgetActive')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND deleted = FALSE;
