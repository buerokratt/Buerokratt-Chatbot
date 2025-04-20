INSERT INTO configuration (key, value)
VALUES
('emergencyNoticeText', :emergencyNoticeText),
(
    'emergencyNoticeStartISO',
    :emergencyNoticeStartISO
),
('emergencyNoticeEndISO', :emergencyNoticeEndISO),
(
    'isEmergencyNoticeVisible',
    :isEmergencyNoticeVisible
)
RETURNING key, value;
