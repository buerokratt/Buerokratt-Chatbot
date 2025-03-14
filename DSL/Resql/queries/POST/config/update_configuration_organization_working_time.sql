WITH
    last_configuration AS (
        SELECT
            key,
            value
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
            'organizationOutsideWorkingHoursMessage'
        )
        AND id IN (
            SELECT MAX(id) FROM configuration
            GROUP BY key
        )
        AND deleted = FALSE
    ),

new_configuration AS (
        SELECT
            new_values.key,
            new_values.value,
            :created::TIMESTAMP WITH TIME ZONE AS created
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
            )
        ) AS new_values (key, value)
    )

INSERT INTO configuration (key, value, created)
SELECT
    new_configuration.key,
    new_configuration.value,
    created
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
