WITH consts AS (
  SELECT 'HH24:MI:SS' AS timeFormat,
         '00:00' AS minTime,
         '23:59:59.999' AS maxTime,
         'YYYY-MM-DD' AS dateFormat
),
organization_time AS
  (SELECT key, value
   FROM configuration
   WHERE KEY IN ('organizationMondayWorkingTimeStartISO',
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
     AND id IN
       (SELECT max(id)
        FROM configuration
        GROUP BY KEY)
     AND deleted = FALSE),
     current_day AS
  (SELECT TRIM(to_char(CURRENT_DATE, 'day')) AS current_day),
     working_week_days AS
  (SELECT value
   FROM organization_time
   WHERE KEY = 'organizationWorkingTimeWeekdays'),
     monday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationMondayWorkingTimeStartISO'),
     monday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationMondayWorkingTimeEndISO'),
     tuesday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationTuesdayWorkingTimeStartISO'),
     tuesday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationTuesdayWorkingTimeEndISO'),
     wednesday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationWednesdayWorkingTimeStartISO'),
     wednesday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationWednesdayWorkingTimeEndISO'),
     thursday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationThursdayWorkingTimeStartISO'),
     thursday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationThursdayWorkingTimeEndISO'),
     friday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationFridayWorkingTimeStartISO'),
     friday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationFridayWorkingTimeEndISO'),
     saturday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationSaturdayWorkingTimeStartISO'),
     saturday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationSaturdayWorkingTimeEndISO'),
     sunday_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationSundayWorkingTimeStartISO'),
     sunday_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationSundayWorkingTimeEndISO'),
     all_weekdays_start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationAllWeekdaysTimeStartISO'),
     all_weekdays_end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationAllWeekdaysTimeEndISO'),
     is_closed_on_weekends AS
  (SELECT value::boolean AS is_closed_on_weekends
   FROM organization_time
   WHERE KEY = 'organizationClosedOnWeekEnds'),
     is_the_same_on_all_working_days AS
  (SELECT value::boolean AS is_the_same_on_all_working_days
   FROM organization_time
   WHERE KEY = 'organizationTheSameOnAllWorkingDays'),
     is_allowed_to_work_at_holidays AS
  (SELECT value::boolean AS is_allowed_to_work_at_holidays
   FROM organization_time
   WHERE KEY = 'organizationWorkingTimeNationalHolidays'),
     is_within_working_time AS
  (SELECT CASE
              WHEN is_the_same_on_all_working_days THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                     (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                      FROM all_weekdays_start_time) AND
                     (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                      FROM all_weekdays_end_time)
              WHEN current_day.current_day = 'monday' THEN CASE
                                                               WHEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM monday_start_time) >
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM monday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM monday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                    OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM monday_end_time)
                                                               ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM monday_start_time) AND
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM monday_end_time)
                                                           END
              WHEN current_day.current_day = 'tuesday' THEN CASE
                                                                WHEN
                                                                       (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                        FROM tuesday_start_time) >
                                                                       (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                        FROM tuesday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                       (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                        FROM tuesday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                     OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                       (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                        FROM tuesday_end_time)
                                                                ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                       (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                        FROM tuesday_start_time) AND
                                                                       (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                        FROM tuesday_end_time)
                                                            END
              WHEN current_day.current_day = 'wednesday' THEN CASE
                                                                  WHEN
                                                                         (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                          FROM wednesday_start_time) >
                                                                         (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                          FROM wednesday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                         (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                          FROM wednesday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                       OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                         (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                          FROM wednesday_end_time)
                                                                  ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                         (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                          FROM wednesday_start_time) AND
                                                                         (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                          FROM wednesday_end_time)
                                                              END
              WHEN current_day.current_day = 'thursday' THEN CASE
                                                                 WHEN
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM thursday_start_time) >
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM thursday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM thursday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                      OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM thursday_end_time)
                                                                 ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM thursday_start_time) AND
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM thursday_end_time)
                                                             END
              WHEN current_day.current_day = 'friday' THEN CASE
                                                               WHEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM friday_start_time) >
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM friday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM friday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                    OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM friday_end_time)
                                                               ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM friday_start_time) AND
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM friday_end_time)
                                                           END
              WHEN current_day.current_day = 'saturday' THEN CASE
                                                                 WHEN
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM saturday_start_time) >
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM saturday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM saturday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                      OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM saturday_end_time)
                                                                 ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM saturday_start_time) AND
                                                                        (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                         FROM saturday_end_time)
                                                             END
              WHEN current_day.current_day = 'sunday' THEN CASE
                                                               WHEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM sunday_start_time) >
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM sunday_end_time) THEN TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM sunday_start_time) AND (SELECT maxTime FROM consts)::TIME
                                                                    OR TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN (SELECT minTime FROM consts)::TIME AND
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM sunday_end_time)
                                                               ELSE TO_CHAR(:current_timestamp::timestamp, (SELECT timeFormat FROM consts))::TIME BETWEEN
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM sunday_start_time) AND
                                                                      (SELECT TO_CHAR(value, (SELECT timeFormat FROM consts))::TIME
                                                                       FROM sunday_end_time)
                                                           END
          END AS is_within_working_time
   FROM current_day,
        is_the_same_on_all_working_days),
     is_within_working_days AS
  (SELECT CASE
              WHEN current_day.current_day = 'saturday'
                   OR current_day.current_day = 'sunday' THEN CASE
                                                                  WHEN is_closed_on_weekends.is_closed_on_weekends THEN FALSE
                                                                  ELSE CASE
                                                                           WHEN EXISTS
                                                                                  (SELECT 1
                                                                                   FROM working_week_days
                                                                                   WHERE TRIM(current_day.current_day) = ANY(string_to_array(value, ','))) THEN TRUE
                                                                           ELSE FALSE
                                                                       END
                                                              END
              ELSE CASE
                       WHEN EXISTS
                              (SELECT 1
                               FROM working_week_days
                               WHERE TRIM(current_day.current_day) = ANY(string_to_array(value, ','))) THEN TRUE
                       ELSE FALSE
                   END
          END AS is_within_working_days
   FROM current_day
   CROSS JOIN is_closed_on_weekends),
     is_today_holiday AS
  (SELECT CASE
              WHEN TO_CHAR(CURRENT_DATE, (SELECT dateFormat FROM consts)) IN (:holidays) THEN format('Bürokratt pole saadaval, kuna täna on %s rahvuspüha "%s", palun jätke oma kontaktandmed ja me võtame teiega esimesel võimalusel ühendust', TO_CHAR(CURRENT_DATE, (SELECT dateFormat FROM consts)), holiday_names)
              ELSE 'Täna pole riigipüha'
          END AS holiday_message,
          CASE
              WHEN TO_CHAR(CURRENT_DATE, (SELECT dateFormat FROM consts)) IN (:holidays) THEN TRUE
              ELSE FALSE
          END AS is_holiday
   FROM
     (SELECT 1) AS holidays
   LEFT JOIN LATERAL
     (SELECT string_agg(SUBSTRING(holiday_name, 12), ' ') AS holiday_names
      FROM unnest(string_to_array(:holiday_names, ',')) AS holiday_name
      WHERE holiday_name LIKE TO_CHAR(CURRENT_DATE, (SELECT dateFormat FROM consts)) || '-%' ) AS holiday_names ON TRUE)
SELECT
  (SELECT is_within_working_time
   FROM is_within_working_time),
  (SELECT is_within_working_days
   FROM is_within_working_days),
  (SELECT is_holiday
   FROM is_today_holiday),
  (SELECT holiday_message
   FROM is_today_holiday),
  (SELECT is_allowed_to_work_at_holidays
   FROM is_allowed_to_work_at_holidays)
