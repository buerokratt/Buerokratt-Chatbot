SELECT
    id,
    key,
    value
FROM config.configuration AS c1
WHERE key IN (
    'emergencyNoticeText',
    'emergencyNoticeStartISO',
    'emergencyNoticeEndISO',
    'isEmergencyNoticeVisible'
)
AND created = (
    SELECT MAX(c2.created) FROM config.configuration as c2
    WHERE c2.key = c1.key
)
AND NOT deleted;
