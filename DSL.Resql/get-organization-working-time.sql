SELECT *
FROM configuration

WHERE (key = 'organizationMondayWorkingTimeStartISO'
   OR key ='organizationMondayWorkingTimeEndISO'
   OR key ='organizationTuesdayWorkingTimeStartISO'
   OR key ='organizationTuesdayWorkingTimeEndISO'
   OR key ='organizationWednesdayWorkingTimeStartISO'
   OR key ='organizationWednesdayWorkingTimeEndISO'
   OR key ='organizationThursdayWorkingTimeStartISO'
   OR key ='organizationThursdayWorkingTimeEndISO'
   OR key ='organizationFridayWorkingTimeStartISO'
   OR key ='organizationFridayWorkingTimeEndISO'
   OR key ='organizationSaturdayWorkingTimeStartISO'
   OR key ='organizationSaturdayWorkingTimeEndISO'
   OR key ='organizationSundayWorkingTimeStartISO'
   OR key ='organizationSundayWorkingTimeEndISO'
   OR key ='organizationAllWeekdaysTimeStartISO'
   OR key ='organizationAllWeekdaysTimeEndISO'
   OR key ='organizationWorkingTimeWeekdays'
   OR key ='organizationClosedOnWeekEnds'
   OR key ='organizationTheSameOnAllWorkingDays'
   OR key ='organizationWorkingTimeNationalHolidays')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND deleted = FALSE;
