WITH organization_time AS
  (SELECT *
   FROM configuration
   WHERE (KEY = 'organizationWorkingTimeStartISO'
          OR KEY ='organizationWorkingTimeEndISO'
          OR KEY ='organizationWorkingTimeWeekdays'
          OR KEY ='organizationWorkingTimeNationalHolidays')
     AND id IN
       (SELECT max(id)
        FROM configuration
        GROUP BY KEY)
     AND deleted = FALSE ),
     current_day AS
  (SELECT to_char(CURRENT_DATE, 'day') AS current_day),
     working_week_days AS
  (SELECT value
   FROM organization_time
   WHERE KEY = 'organizationWorkingTimeWeekdays' ),
     start_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationWorkingTimeStartISO'),
     end_time AS
  (SELECT value::timestamp
   FROM organization_time
   WHERE KEY = 'organizationWorkingTimeEndISO'),
     is_allowed_to_work_at_holidays AS
  (SELECT value::boolean AS is_allowed_to_work_at_holidays
   FROM organization_time
   WHERE KEY = 'organizationWorkingTimeNationalHolidays'),
     is_within_working_time AS
  (SELECT TO_CHAR(CURRENT_TIMESTAMP, 'HH24:MI:SS') BETWEEN
     (SELECT TO_CHAR(value, 'HH24:MI:SS')
      FROM start_time) AND
     (SELECT TO_CHAR(value, 'HH24:MI:SS')
      FROM end_time) AS is_within_working_time),
     is_within_working_days AS
  (SELECT CASE
              WHEN EXISTS
                     (SELECT 1
                      FROM working_week_days
                      WHERE trim(current_day) = ANY(string_to_array(value, ',')) ) THEN TRUE
              ELSE FALSE
          END AS is_within_working_days
   FROM current_day),
     is_today_holiday AS
  (SELECT CASE
              WHEN TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') IN (:holidays) THEN format('Bürokratt pole saadaval, kuna täna on %s rahvuspüha "%s", palun jätke oma kontaktandmed ja me võtame teiega esimesel võimalusel ühendust', TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD'), holiday_names)
              ELSE 'Täna pole riigipüha'
          END AS holiday_message,
          CASE
              WHEN TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') IN (:holidays) THEN TRUE
              ELSE FALSE
          END AS is_holiday
   FROM
     (SELECT 1) AS holidays
   LEFT JOIN LATERAL
     (SELECT string_agg(SUBSTRING(holiday_name, 12), ' ') AS holiday_names
      FROM unnest(string_to_array(:holiday_names, ',')) AS holiday_name
      WHERE holiday_name LIKE TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') || '-%' ) AS holiday_names ON TRUE)
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
