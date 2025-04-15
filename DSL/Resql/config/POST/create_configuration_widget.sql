INSERT INTO configuration (key, value, created)
VALUES (
    'widgetProactiveSeconds',
    :widgetProactiveSeconds,
    :created::TIMESTAMP WITH TIME ZONE
),
(
    'widgetDisplayBubbleMessageSeconds',
    :widgetDisplayBubbleMessageSeconds,
    :created::TIMESTAMP WITH TIME ZONE
),
(
    'widgetBubbleMessageText',
    :widgetBubbleMessageText,
    :created::TIMESTAMP WITH TIME ZONE
),
('widgetColor', :widgetColor, :created::TIMESTAMP WITH TIME ZONE),
('isWidgetActive', :isWidgetActive, :created::TIMESTAMP WITH TIME ZONE),
('widgetAnimation', :widgetAnimation, :created::TIMESTAMP WITH TIME ZONE)
RETURNING key, value;
