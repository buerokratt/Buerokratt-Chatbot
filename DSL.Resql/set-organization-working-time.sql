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
        ('organizationMondayWorkingTimeStartISO', TO_CHAR(:organizationMondayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationMondayWorkingTimeEndISO', TO_CHAR(:organizationMondayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationTuesdayWorkingTimeStartISO', TO_CHAR(:organizationTuesdayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationTuesdayWorkingTimeEndISO', TO_CHAR(:organizationTuesdayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationWednesdayWorkingTimeStartISO', TO_CHAR(:organizationWednesdayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationWednesdayWorkingTimeEndISO', TO_CHAR(:organizationWednesdayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationThursdayWorkingTimeStartISO', TO_CHAR(:organizationThursdayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationThursdayWorkingTimeEndISO', TO_CHAR(:organizationThursdayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationFridayWorkingTimeStartISO', TO_CHAR(:organizationFridayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationFridayWorkingTimeEndISO', TO_CHAR(:organizationFridayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationSaturdayWorkingTimeStartISO', TO_CHAR(:organizationSaturdayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationSaturdayWorkingTimeEndISO', TO_CHAR(:organizationSaturdayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationSundayWorkingTimeStartISO', TO_CHAR(:organizationSundayWorkingTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationSundayWorkingTimeEndISO', TO_CHAR(:organizationSundayWorkingTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationAllWeekdaysTimeStartISO', TO_CHAR(:organizationAllWeekdaysTimeStartISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
        ('organizationAllWeekdaysTimeEndISO', TO_CHAR(:organizationAllWeekdaysTimeEndISO::timestamp AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')),
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
