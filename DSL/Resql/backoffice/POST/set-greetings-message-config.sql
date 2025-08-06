INSERT INTO configuration (key, value, created)
VALUES
    ('is_greeting_message_active', :isActive, :created::timestamp with time zone),
    ('greeting_message_est', :message, :created::timestamp with time zone),
    RETURNING key, value;
