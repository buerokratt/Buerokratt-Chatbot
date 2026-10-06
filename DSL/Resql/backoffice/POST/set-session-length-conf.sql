INSERT INTO configuration (key, value, created)
VALUES
    ('session_length', :session_length, :created::timestamp with time zone),
    ('chat_active_duration', :chat_active_duration, :created::timestamp with time zone),
    ('show_idle_warning', :show_idle_warning, :created::timestamp with time zone),
    ('idle_message', :idle_message, :created::timestamp with time zone),
    ('show_auto_close_text', :show_auto_close_text, :created::timestamp with time zone),
    ('auto_close_text', :auto_close_text, :created::timestamp with time zone),
    ('away_status_active', :away_status_active, :created::timestamp with time zone),
    ('away_status_timeout', :away_status_timeout, :created::timestamp with time zone)
    RETURNING key, value;