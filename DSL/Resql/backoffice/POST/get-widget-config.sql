SELECT id, key, value
FROM configuration
WHERE key IN (
   'widgetProactiveSeconds',
   'widgetDisplayBubbleMessageSeconds',
   'widgetBubbleMessageText',
   'widgetColor',
   'isWidgetActive',
   'widgetAnimation',
   'chat_active_duration',
   'show_idle_warning',
   'auto_close_conversation',
   'auto_close_text',
   'is_burokratt_active')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND NOT deleted;
