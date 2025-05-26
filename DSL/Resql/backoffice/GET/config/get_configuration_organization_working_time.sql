/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration entry for organization working time"
  method: get
  namespace: config
  allowlist:
    query:
      - field: key
        type: string
        description: "Configuration key to retrieve"
  response:
    fields:
      - field: id
        type: string
        description: "Unique identifier for the configuration entry"
      - field: key
        type: string
        description: "Key of the configuration setting"
      - field: value
        type: string
        description: "Value associated with the configuration key"
      - field: created
        type: timestamp
        description: "Timestamp of configuration record creation"
*/
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
