/*
declaration:
  version: 0.1
  description: "Fetch the latest non-deleted configuration entry for organization working time"
  method: get
  namespace: config
  returns: json
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
FROM config.configuration AS c_1
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
    SELECT MAX(c_2.created) FROM config.configuration AS c_2
    WHERE c_2.key = c_1.key
)
AND NOT deleted;
