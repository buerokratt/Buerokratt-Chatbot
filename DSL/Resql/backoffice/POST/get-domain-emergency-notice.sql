SELECT id, key, value
FROM configuration
WHERE key IN (
   'emergencyNoticeText',
   'emergencyNoticeStartISO',
   'emergencyNoticeEndISO',
   'isEmergencyNoticeVisible')
  AND "domain" = :domainUUID::UUID
  AND id IN (SELECT max(id) from configuration where "domain" = :domainUUID::UUID GROUP BY key)
  AND NOT deleted;
