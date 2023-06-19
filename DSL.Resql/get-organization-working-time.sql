SELECT *
FROM configuration

WHERE (key = 'organizationWorkingTimeStartISO'
   OR key ='organizationWorkingTimeEndISO'
   OR key ='organizationWorkingTimeWeekdays'
   OR key ='organizationWorkingTimeNationalHolidays')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND deleted = FALSE;
