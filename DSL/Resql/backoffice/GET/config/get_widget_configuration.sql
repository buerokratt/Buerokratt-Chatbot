/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration entry for widget"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier for the configuration entry"
      - field: key
        type: string
        description: "Key of the configuration setting"
      - field: value
        type: string
        description: "Value associated with the configuration key"
*/
SELECT
    id,
    key,
    value
FROM configuration AS c1
WHERE key IN (
    'widgetProactiveSeconds',
    'widgetDisplayBubbleMessageSeconds',
    'widgetBubbleMessageText',
    'widgetColor',
    'isWidgetActive',
    'widgetAnimation',
    'is_burokratt_active'
)
AND created = (
    SELECT MAX(c2.created) FROM configuration as c2
    WHERE c2.key = c1.key
)
AND NOT deleted;
