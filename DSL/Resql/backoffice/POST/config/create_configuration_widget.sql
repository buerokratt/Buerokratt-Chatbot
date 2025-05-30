/*
declaration:
  version: 0.1
  description: "Insert configuration settings for the widget display behavior and style"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: widgetProactiveSeconds
        type: string
        description: "Delay in seconds before the widget proactively appears"
      - field: widgetDisplayBubbleMessageSeconds
        type: string
        description: "Delay before showing a bubble message in the widget"
      - field: widgetBubbleMessageText
        type: string
        description: "Text content of the widget's bubble message"
      - field: widgetColor
        type: string
        description: "Hex color code for the widget interface"
      - field: isWidgetActive
        type: string
        description: "Flag indicating whether the widget is active"
      - field: widgetAnimation
        type: string
        description: "Animation style or toggle for the widget"
  response:
    fields:
      - field: key
        type: string
        description: "Configuration key name"
      - field: value
        type: string
        description: "Associated configuration value"
*/
INSERT INTO config.configuration (key, value)
VALUES (
    'widgetProactiveSeconds',
    :widgetProactiveSeconds
),
(
    'widgetDisplayBubbleMessageSeconds',
    :widgetDisplayBubbleMessageSeconds
),
(
    'widgetBubbleMessageText',
    :widgetBubbleMessageText
),
('widgetColor', :widgetColor),
('isWidgetActive', :isWidgetActive),
('widgetAnimation', :widgetAnimation)
RETURNING key, value;
