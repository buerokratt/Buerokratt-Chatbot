INSERT INTO configuration (key, value, created)
VALUES
    ('organizationMondayWorkingTimeStartISO', :organizationMondayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationMondayWorkingTimeEndISO', :organizationMondayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationTuesdayWorkingTimeStartISO', :organizationTuesdayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationTuesdayWorkingTimeEndISO', :organizationTuesdayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationWednesdayWorkingTimeStartISO', :organizationWednesdayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationWednesdayWorkingTimeEndISO', :organizationWednesdayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationThursdayWorkingTimeStartISO', :organizationThursdayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationThursdayWorkingTimeEndISO', :organizationThursdayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationFridayWorkingTimeStartISO', :organizationFridayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationFridayWorkingTimeEndISO', :organizationFridayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationSaturdayWorkingTimeStartISO', :organizationSaturdayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationSaturdayWorkingTimeEndISO', :organizationSaturdayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationSundayWorkingTimeStartISO', :organizationSundayWorkingTimeStartISO, :created::timestamp with time zone),
    ('organizationSundayWorkingTimeEndISO', :organizationSundayWorkingTimeEndISO, :created::timestamp with time zone),
    ('organizationAllWeekdaysTimeStartISO', :organizationAllWeekdaysTimeStartISO, :created::timestamp with time zone),
    ('organizationAllWeekdaysTimeEndISO', :organizationAllWeekdaysTimeEndISO, :created::timestamp with time zone),
    ('organizationWorkingTimeWeekdays', :organizationWorkingTimeWeekdays, :created::timestamp with time zone),
    ('organizationClosedOnWeekEnds', :organizationClosedOnWeekEnds, :created::timestamp with time zone),
    ('organizationTheSameOnAllWorkingDays', :organizationTheSameOnAllWorkingDays, :created::timestamp with time zone),
    ('organizationWorkingTimeNationalHolidays', :organizationWorkingTimeNationalHolidays, :created::timestamp with time zone)
RETURNING key, value;
