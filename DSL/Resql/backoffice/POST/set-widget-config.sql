INSERT INTO configuration (key, value, created)
VALUES ('widgetProactiveSeconds', :widgetProactiveSeconds, :created::timestamp with time zone),
       ('widgetDisplayBubbleMessageSeconds', :widgetDisplayBubbleMessageSeconds, :created::timestamp with time zone),
       ('widgetBubbleMessageText', :widgetBubbleMessageText, :created::timestamp with time zone),
       ('widgetColor', :widgetColor, :created::timestamp with time zone),
       ('isWidgetActive', :isWidgetActive, :created::timestamp with time zone),
       ('widgetAnimation', :widgetAnimation, :created::timestamp with time zone)
RETURNING key, value;
