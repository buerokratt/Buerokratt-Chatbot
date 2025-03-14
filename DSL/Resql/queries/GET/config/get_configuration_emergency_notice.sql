SELECT
    id,
    key,
    value
FROM configuration
WHERE key IN (
    'emergencyNoticeText',
    'emergencyNoticeStartISO',
    'emergencyNoticeEndISO',
    'isEmergencyNoticeVisible'
)
AND id IN (
    SELECT MAX(id) FROM configuration
    GROUP BY key
)
AND NOT deleted;
