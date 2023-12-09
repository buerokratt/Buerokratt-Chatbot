WITH last_configuration AS (
    SELECT key, value
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
     'organizationWorkingTimeNationalHolidays')
    AND id IN (SELECT max(id) from configuration GROUP BY key)
    AND deleted = FALSE
), new_configuration as (
  SELECT new_values.key, new_values.value, :created::timestamp with time zone as created
  FROM (
    VALUES
        ('organizationMondayWorkingTimeStartISO', :organizationMondayWorkingTimeStartISO),
        ('organizationMondayWorkingTimeEndISO', :organizationMondayWorkingTimeEndISO),
        ('organizationTuesdayWorkingTimeStartISO', :organizationTuesdayWorkingTimeStartISO),
        ('organizationTuesdayWorkingTimeEndISO', :organizationTuesdayWorkingTimeEndISO),
        ('organizationWednesdayWorkingTimeStartISO', :organizationWednesdayWorkingTimeStartISO),
        ('organizationWednesdayWorkingTimeEndISO', :organizationWednesdayWorkingTimeEndISO),
        ('organizationThursdayWorkingTimeStartISO', :organizationThursdayWorkingTimeStartISO),
        ('organizationThursdayWorkingTimeEndISO', :organizationThursdayWorkingTimeEndISO),
        ('organizationFridayWorkingTimeStartISO', :organizationFridayWorkingTimeStartISO),
        ('organizationFridayWorkingTimeEndISO', :organizationFridayWorkingTimeEndISO),
        ('organizationSaturdayWorkingTimeStartISO', :organizationSaturdayWorkingTimeStartISO),
        ('organizationSaturdayWorkingTimeEndISO', :organizationSaturdayWorkingTimeEndISO),
        ('organizationSundayWorkingTimeStartISO', :organizationSundayWorkingTimeStartISO),
        ('organizationSundayWorkingTimeEndISO', :organizationSundayWorkingTimeEndISO),
        ('organizationAllWeekdaysTimeStartISO', :organizationAllWeekdaysTimeStartISO),
        ('organizationAllWeekdaysTimeEndISO', :organizationAllWeekdaysTimeEndISO),
        ('organizationWorkingTimeWeekdays', :organizationWorkingTimeWeekdays),
        ('organizationClosedOnWeekEnds', :organizationClosedOnWeekEnds),
        ('organizationTheSameOnAllWorkingDays', :organizationTheSameOnAllWorkingDays),
        ('organizationWorkingTimeNationalHolidays', :organizationWorkingTimeNationalHolidays)
   ) as new_values (key, value)
)
INSERT INTO configuration (key, value, created)
SELECT new_configuration.key, new_configuration.value, created from new_configuration 
JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
