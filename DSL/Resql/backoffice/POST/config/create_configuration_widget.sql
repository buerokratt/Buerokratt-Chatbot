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
