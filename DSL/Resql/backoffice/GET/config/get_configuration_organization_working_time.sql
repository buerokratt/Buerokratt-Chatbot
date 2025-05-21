SELECT
    id,
    key,
    value,
    created
FROM configuration AS c1
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
    'organizationBotCannotAnswerMessage'
)
AND created = (
    SELECT MAX(c2.created) FROM configuration as c2
    WHERE c2.key = c1.key
)
AND NOT deleted;
