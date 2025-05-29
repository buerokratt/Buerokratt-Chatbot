/*
declaration:
  version: 0.1
  description: "Insert updated organization schedule and messaging configuration only if values have changed from the most recent entries"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: organizationMondayWorkingTimeStartISO
        type: string
        description: "Start time on Monday in ISO format"
      - field: organizationMondayWorkingTimeEndISO
        type: string
        description: "End time on Monday in ISO format"
      - field: organizationTuesdayWorkingTimeStartISO
        type: string
        description: "Start time on Tuesday in ISO format"
      - field: organizationTuesdayWorkingTimeEndISO
        type: string
        description: "End time on Tuesday in ISO format"
      - field: organizationWednesdayWorkingTimeStartISO
        type: string
        description: "Start time on Wednesday in ISO format"
      - field: organizationWednesdayWorkingTimeEndISO
        type: string
        description: "End time on Wednesday in ISO format"
      - field: organizationThursdayWorkingTimeStartISO
        type: string
        description: "Start time on Thursday in ISO format"
      - field: organizationThursdayWorkingTimeEndISO
        type: string
        description: "End time on Thursday in ISO format"
      - field: organizationFridayWorkingTimeStartISO
        type: string
        description: "Start time on Friday in ISO format"
      - field: organizationFridayWorkingTimeEndISO
        type: string
        description: "End time on Friday in ISO format"
      - field: organizationSaturdayWorkingTimeStartISO
        type: string
        description: "Start time on Saturday in ISO format"
      - field: organizationSaturdayWorkingTimeEndISO
        type: string
        description: "End time on Saturday in ISO format"
      - field: organizationSundayWorkingTimeStartISO
        type: string
        description: "Start time on Sunday in ISO format"
      - field: organizationSundayWorkingTimeEndISO
        type: string
        description: "End time on Sunday in ISO format"
      - field: organizationAllWeekdaysTimeStartISO
        type: string
        description: "General start time for all weekdays"
      - field: organizationAllWeekdaysTimeEndISO
        type: string
        description: "General end time for all weekdays"
      - field: organizationWorkingTimeWeekdays
        type: string
        description: "List of weekdays the organization is open"
      - field: organizationClosedOnWeekEnds
        type: string
        description: "Boolean indicating if weekends are closed"
      - field: organizationTheSameOnAllWorkingDays
        type: string
        description: "Boolean for applying the same schedule to all weekdays"
      - field: organizationWorkingTimeNationalHolidays
        type: string
        description: "Boolean or list for national holiday closures"
      - field: organizationWorkingAllTime
        type: string
        description: "Boolean for 24/7 operation"
      - field: organizationNoCsaAskForContacts
        type: string
        description: "Prompt message when no CSA is available, requesting contact info"
      - field: organizationNoCsaAvailableMessage
        type: string
        description: "Message displayed when no CSA is available"
      - field: organizationOutsideWorkingHoursAskForContacts
        type: string
        description: "Prompt for contact info outside working hours"
      - field: organizationOutsideWorkingHoursMessage
        type: string
        description: "Message shown when outside working hours"
      - field: organizationBotCannotAnswerAskToForwardToCSA
        type: string
        description: "Prompt when bot can't answer, suggesting forward to CSA"
      - field: organizationBotCannotAnswerMessage
        type: string
        description: "Message when bot cannot provide an answer"
*/
WITH
    last_configuration AS (
        SELECT
            key,
            value
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
            'organizationOutsideWorkingHoursMessage'
            'organizationBotCannotAnswerAskToForwardToCSA',
            'organizationBotCannotAnswerMessage'
        )
        AND created = (
            SELECT MAX(c_2.created) FROM config.configuration AS c_2
            WHERE c_1.key = c_2.key
        )
        AND deleted = FALSE
    ),

    new_configuration AS (
        SELECT
            new_values.key,
            new_values.value
        FROM (
            VALUES
            (
                'organizationMondayWorkingTimeStartISO',
                :organizationMondayWorkingTimeStartISO
            ),
            (
                'organizationMondayWorkingTimeEndISO',
                :organizationMondayWorkingTimeEndISO
            ),
            (
                'organizationTuesdayWorkingTimeStartISO',
                :organizationTuesdayWorkingTimeStartISO
            ),
            (
                'organizationTuesdayWorkingTimeEndISO',
                :organizationTuesdayWorkingTimeEndISO
            ),
            (
                'organizationWednesdayWorkingTimeStartISO',
                :organizationWednesdayWorkingTimeStartISO
            ),
            (
                'organizationWednesdayWorkingTimeEndISO',
                :organizationWednesdayWorkingTimeEndISO
            ),
            (
                'organizationThursdayWorkingTimeStartISO',
                :organizationThursdayWorkingTimeStartISO
            ),
            (
                'organizationThursdayWorkingTimeEndISO',
                :organizationThursdayWorkingTimeEndISO
            ),
            (
                'organizationFridayWorkingTimeStartISO',
                :organizationFridayWorkingTimeStartISO
            ),
            (
                'organizationFridayWorkingTimeEndISO',
                :organizationFridayWorkingTimeEndISO
            ),
            (
                'organizationSaturdayWorkingTimeStartISO',
                :organizationSaturdayWorkingTimeStartISO
            ),
            (
                'organizationSaturdayWorkingTimeEndISO',
                :organizationSaturdayWorkingTimeEndISO
            ),
            (
                'organizationSundayWorkingTimeStartISO',
                :organizationSundayWorkingTimeStartISO
            ),
            (
                'organizationSundayWorkingTimeEndISO',
                :organizationSundayWorkingTimeEndISO
            ),
            (
                'organizationAllWeekdaysTimeStartISO',
                :organizationAllWeekdaysTimeStartISO
            ),
            (
                'organizationAllWeekdaysTimeEndISO',
                :organizationAllWeekdaysTimeEndISO
            ),
            (
                'organizationWorkingTimeWeekdays',
                :organizationWorkingTimeWeekdays
            ),
            ('organizationClosedOnWeekEnds', :organizationClosedOnWeekEnds),
            (
                'organizationTheSameOnAllWorkingDays',
                :organizationTheSameOnAllWorkingDays
            ),
            (
                'organizationWorkingTimeNationalHolidays',
                :organizationWorkingTimeNationalHolidays
            ),
            ('organizationWorkingAllTime', :organizationWorkingAllTime),
            (
                'organizationNoCsaAskForContacts',
                :organizationNoCsaAskForContacts
            ),
            (
                'organizationNoCsaAvailableMessage',
                :organizationNoCsaAvailableMessage
            ),
            (
                'organizationOutsideWorkingHoursAskForContacts',
                :organizationOutsideWorkingHoursAskForContacts
            ),
            (
                'organizationOutsideWorkingHoursMessage',
                :organizationOutsideWorkingHoursMessage
            ),
            (
                'organizationBotCannotAnswerAskToForwardToCSA',
                :organizationBotCannotAnswerAskToForwardToCSA
            ),
            (
                'organizationBotCannotAnswerMessage',
                :organizationBotCannotAnswerMessage
            )
        ) AS new_values (key, value)
    )

INSERT INTO configuration (key, value)
SELECT
    new_configuration.key,
    new_configuration.value
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
