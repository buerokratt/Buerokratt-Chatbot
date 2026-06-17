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
   'organizationBotCannotAnswerMessage',
   'organizationRedirectIfBotCannotAnswerMessage',
   'organizationUseCSA',
   'organizationValidationNoCsaMessage')
  AND "domain" = :domainUUID::UUID
  AND id IN (SELECT max(id) from configuration where "domain" = :domainUUID::UUID GROUP BY key)
  AND NOT deleted;
