WITH
    consts AS (
        SELECT
            'HH24:MI:SS' AS time_format,
            '00:00' AS min_time,
            '23:59:59.999' AS max_time,
            'YYYY-MM-DD' AS date_format
    ),

    organization_time AS (
        SELECT
            key,
            value
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
            'organizationWorkingTimeNationalHolidays'
        )
        AND created = (
            SELECT MAX(c2.created) FROM configuration as c2
            WHERE c2.key = c1.key
        )
        AND deleted = FALSE
    ),

    current_day AS (SELECT TRIM(TO_CHAR(CURRENT_DATE, 'day')) AS current_day),

    working_week_days AS (
        SELECT value
        FROM organization_time
        WHERE key = 'organizationWorkingTimeWeekdays'
    ),

    monday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationMondayWorkingTimeStartISO'
    ),

    monday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationMondayWorkingTimeEndISO'
    ),

    tuesday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationTuesdayWorkingTimeStartISO'
    ),

    tuesday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationTuesdayWorkingTimeEndISO'
    ),

    wednesday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationWednesdayWorkingTimeStartISO'
    ),

    wednesday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationWednesdayWorkingTimeEndISO'
    ),

    thursday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationThursdayWorkingTimeStartISO'
    ),

    thursday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationThursdayWorkingTimeEndISO'
    ),

    friday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationFridayWorkingTimeStartISO'
    ),

    friday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationFridayWorkingTimeEndISO'
    ),

    saturday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationSaturdayWorkingTimeStartISO'
    ),

    saturday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationSaturdayWorkingTimeEndISO'
    ),

    sunday_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationSundayWorkingTimeStartISO'
    ),

    sunday_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationSundayWorkingTimeEndISO'
    ),

    all_weekdays_start_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationAllWeekdaysTimeStartISO'
    ),

    all_weekdays_end_time AS (
        SELECT value::TIMESTAMP
        FROM organization_time
        WHERE key = 'organizationAllWeekdaysTimeEndISO'
    ),

    is_closed_on_weekends AS (
        SELECT value::BOOLEAN AS is_closed_on_weekends
        FROM organization_time
        WHERE key = 'organizationClosedOnWeekEnds'
    ),

    is_the_same_on_all_working_days AS (
        SELECT value::BOOLEAN AS is_the_same_on_all_working_days
        FROM organization_time
        WHERE key = 'organizationTheSameOnAllWorkingDays'
    ),

    is_allowed_to_work_at_holidays AS (
        SELECT value::BOOLEAN AS is_allowed_to_work_at_holidays
        FROM organization_time
        WHERE key = 'organizationWorkingTimeNationalHolidays'
    ),

    is_within_working_time AS (
        SELECT
            CASE
                WHEN
                    is_the_same_on_all_working_days
                    THEN
                        TO_CHAR(
                            now(),
                            (SELECT time_format FROM consts)
                        )::TIME
                WHEN current_day.current_day = 'monday'
                    THEN CASE
                        WHEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM monday_start_time
                            )
                            > (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM monday_end_time
                            )
                            THEN
                                TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM monday_start_time
                                ) AND (SELECT max_time FROM consts
                                )::TIME
                                OR TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN (SELECT min_time FROM consts
                                )::TIME AND
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM monday_end_time
                                )
                        ELSE
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM monday_start_time
                            ) AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM monday_end_time
                            )
                    END
                WHEN current_day.current_day = 'tuesday'
                    THEN CASE
                        WHEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM tuesday_start_time
                            )
                            > (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM tuesday_end_time
                            )
                            THEN
                                TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM tuesday_start_time
                                ) AND (SELECT max_time FROM consts
                                )::TIME
                                OR TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN (SELECT min_time FROM consts
                                )::TIME AND
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM tuesday_end_time
                                )
                        ELSE
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM tuesday_start_time
                            ) AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM tuesday_end_time
                            )
                    END
                WHEN current_day.current_day = 'wednesday'
                    THEN CASE
                        WHEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM wednesday_start_time
                            )
                            > (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM wednesday_end_time
                            )
                            THEN
                                TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM wednesday_start_time
                                ) AND (SELECT max_time FROM consts
                                )::TIME
                                OR TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN (SELECT min_time FROM consts
                                )::TIME AND
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM wednesday_end_time
                                )
                        ELSE
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM wednesday_start_time
                            ) AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM wednesday_end_time
                            )
                    END
                WHEN current_day.current_day = 'thursday'
                    THEN CASE
                        WHEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM thursday_start_time
                            )
                            > (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM thursday_end_time
                            )
                            THEN
                                TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM thursday_start_time
                                ) AND (SELECT max_time FROM consts
                                )::TIME
                                OR TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN (SELECT min_time FROM consts
                                )::TIME AND
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM thursday_end_time
                                )
                        ELSE
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM thursday_start_time
                            ) AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM thursday_end_time
                            )
                    END
                WHEN current_day.current_day = 'friday'
                    THEN CASE
                        WHEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM friday_start_time
                            )
                            > (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM friday_end_time
                            )
                            THEN
                                TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM friday_start_time
                                ) AND (SELECT max_time FROM consts
                                )::TIME
                                OR TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN (SELECT min_time FROM consts
                                )::TIME AND
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM friday_end_time
                                )
                        ELSE
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM friday_start_time
                            ) AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM friday_end_time
                            )
                    END
                WHEN current_day.current_day = 'saturday'
                    THEN CASE
                        WHEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM saturday_start_time
                            )
                            > (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM saturday_end_time
                            )
                            THEN
                                TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM saturday_start_time
                                ) AND (SELECT max_time FROM consts
                                )::TIME
                                OR TO_CHAR(
                                    now(),
                                    (SELECT time_format FROM consts)
                                )::TIME BETWEEN (SELECT min_time FROM consts
                                )::TIME AND
                                (
                                    SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                    FROM saturday_end_time
                                )
                        ELSE
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM saturday_start_time
                            ) AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM saturday_end_time
                            )
                    END
                WHEN current_day.current_day = 'sunday' THEN CASE
                    WHEN
                        (
                            SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                            FROM sunday_start_time
                        )
                        > (
                            SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                            FROM sunday_end_time
                        )
                        THEN
                            TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM sunday_start_time
                            ) AND (SELECT max_time FROM consts
                            )::TIME
                            OR TO_CHAR(
                                now(),
                                (SELECT time_format FROM consts)
                            )::TIME BETWEEN (SELECT min_time FROM consts
                            )::TIME AND
                            (
                                SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                                FROM sunday_end_time
                            )
                    ELSE
                        TO_CHAR(
                            now(),
                            (SELECT time_format FROM consts)
                        )::TIME BETWEEN
                        (
                            SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                            FROM sunday_start_time
                        ) AND
                        (
                            SELECT TO_CHAR(value, (SELECT time_format FROM consts))::TIME
                            FROM sunday_end_time
                        )
                END
            END AS is_within_working_time
        FROM current_day,
            is_the_same_on_all_working_days
    ),

    is_within_working_days AS (
        SELECT
            CASE
                WHEN
                    current_day.current_day = 'saturday'
                    OR current_day.current_day = 'sunday'
                    THEN CASE
                        WHEN is_closed_on_weekends.is_closed_on_weekends THEN FALSE
                        ELSE
                            COALESCE(EXISTS
                            (
                                SELECT 1
                                FROM working_week_days
                                WHERE
                                    TRIM(current_day.current_day)
                                    = ANY(STRING_TO_ARRAY(value, ','))
                            ), FALSE)
                    END
                ELSE
                    COALESCE(EXISTS
                    (
                        SELECT 1
                        FROM working_week_days
                        WHERE
                            TRIM(current_day.current_day)
                            = ANY(STRING_TO_ARRAY(value, ','))
                    ), FALSE)
            END AS is_within_working_days
        FROM current_day
            CROSS JOIN is_closed_on_weekends
    ),

    is_today_holiday AS (
        SELECT
            CASE
                WHEN
                    TO_CHAR(CURRENT_DATE, (SELECT date_format FROM consts)) IN (
                        :holidays
                    )
                    THEN
                        FORMAT(
                            'Bürokratt pole saadaval, kuna täna on %s rahvuspüha "%s", palun jätke oma kontaktandmed ja me võtame teiega esimesel võimalusel ühendust',
                            TO_CHAR(CURRENT_DATE, (SELECT date_format FROM consts)),
                            holiday_names
                        )
                ELSE 'Täna pole riigipüha'
            END AS holiday_message,
            CASE
                WHEN
                    TO_CHAR(CURRENT_DATE, (SELECT date_format FROM consts)) IN (
                        :holidays
                    )
                    THEN TRUE
                ELSE FALSE
            END AS is_holiday
        FROM
            (SELECT 1) AS holidays
            LEFT JOIN
                LATERAL
                (
                    SELECT STRING_AGG(SUBSTRING(holiday_name, 12), ' ') AS holiday_names
                    FROM UNNEST(STRING_TO_ARRAY(:holiday_names, ',')) AS holiday_name
                    WHERE
                        holiday_name LIKE TO_CHAR(
                            CURRENT_DATE, (SELECT date_format FROM consts)
                        )
                        || '-%'
                ) AS holiday_names ON TRUE
    )

SELECT
    (
        SELECT is_within_working_time
        FROM is_within_working_time
    ),
    (
        SELECT is_within_working_days
        FROM is_within_working_days
    ),
    (
        SELECT is_holiday
        FROM is_today_holiday
    ),
    (
        SELECT holiday_message
        FROM is_today_holiday
    ),
    (
        SELECT is_allowed_to_work_at_holidays
        FROM is_allowed_to_work_at_holidays
    )
