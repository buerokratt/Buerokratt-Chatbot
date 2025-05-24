WITH
    last_configuration AS (
        SELECT
            key,
            value
        FROM config.configuration AS c1
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
            SELECT MAX(c2.created) FROM config.configuration AS c2
            WHERE c1.key = c2.key
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
            ('organizationAllWeekdaysTimeEndISO', :organizationAllWeekdaysTimeEndISO),
            ('organizationWorkingTimeWeekdays', :organizationWorkingTimeWeekdays),
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
            ('organizationNoCsaAskForContacts', :organizationNoCsaAskForContacts),
            ('organizationNoCsaAvailableMessage', :organizationNoCsaAvailableMessage),
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

INSERT INTO config.configuration (key, value)
SELECT
    new_configuration.key,
    new_configuration.value
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
