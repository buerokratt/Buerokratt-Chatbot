SELECT id, key, value, created
FROM configuration
WHERE key IN (
   'organizationMondayWorkingTimeStartISO',
   'organizationMondayWorkingTimeEndISO',
   'organizationTuesdayWorkingTimeStartISO',
   'organizationTuesdayWorkingTimeEndISO',
   'organizationWednesdayWorkingTimeStartISO',
   'organizationWednesdayWorkingTimeEndISO',
   'organizationThursdayWorkingTimeStartISO',
   'organizationThursdayWorkingTimeEndISO',
   'organizationFridayWorkingTimeStartISO',
   'organizationFridayWorkingTimeEndISO',
   'organizationSaturdayWorkingTimeStartISO',
   'organizationSaturdayWorkingTimeEndISO',
   'organizationSundayWorkingTimeStartISO',
   'organizationSundayWorkingTimeEndISO',
   'organizationAllWeekdaysTimeStartISO',
   'organizationAllWeekdaysTimeEndISO',
   'organizationWorkingTimeWeekdays',
   'organizationClosedOnWeekEnds',
   'organizationTheSameOnAllWorkingDays',
   'organizationWorkingTimeNationalHolidays',
   'organizationWorkingAllTime',
   'organizationNoCsaAskForContacts',
   'organizationNoCsaAvailableMessage',
   'organizationOutsideWorkingHoursAskForContacts',
   'organizationOutsideWorkingHoursMessage',
   'organizationBotCannotAnswerAskToForwardToCSA',
   'organizationBotCannotAnswerMessage')
  AND id IN (SELECT max(id) from configuration GROUP BY key)
  AND NOT deleted;
