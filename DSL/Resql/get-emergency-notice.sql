SELECT *
FROM configuration

WHERE (key ='emergencyNoticeText'
   OR key ='emergencyNoticeStartISO'
   OR key ='emergencyNoticeEndISO'
   OR key ='isEmergencyNoticeVisible')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND deleted = FALSE;
