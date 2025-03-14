INSERT INTO configuration (key, value, created)
VALUES
('emergencyNoticeText', :emergencyNoticeText, :created::TIMESTAMP WITH TIME ZONE),
(
    'emergencyNoticeStartISO',
    :emergencyNoticeStartISO,
    :created::TIMESTAMP WITH TIME ZONE
),
('emergencyNoticeEndISO', :emergencyNoticeEndISO, :created::TIMESTAMP WITH TIME ZONE),
(
    'isEmergencyNoticeVisible',
    :isEmergencyNoticeVisible,
    :created::TIMESTAMP WITH TIME ZONE
)
RETURNING key, value;
