INSERT INTO configuration (key, value, created)
VALUES
    ('emergencyNoticeText', :emergencyNoticeText, :created::timestamp with time zone),
    ('emergencyNoticeStartISO', :emergencyNoticeStartISO, :created::timestamp with time zone),
    ('emergencyNoticeEndISO', :emergencyNoticeEndISO, :created::timestamp with time zone),
    ('isEmergencyNoticeVisible', :isEmergencyNoticeVisible, :created::timestamp with time zone)
RETURNING key, value;
