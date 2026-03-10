WITH
    domain_list AS (
        SELECT (jsonb_array_elements_text(:domains::jsonb))::uuid AS domain
    ),

    last_configuration AS (
SELECT
    c.domain,
    c.key,
    c.value
FROM configuration AS c
    JOIN domain_list AS d
ON c.domain = d.domain
WHERE
    c.key IN (
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
    'organizationBotCannotAnswerMessage',
    'organizationRedirectIfBotCannotAnswerMessage',
    'organizationUseCSA'
    )
  AND c.deleted = FALSE
  AND c.id = (
    SELECT MAX(id)
    FROM configuration AS c2
    WHERE
    c2.domain = c.domain
  AND c2.key    = c.key
    )
    ),

    new_configuration AS (
SELECT
    v.key,
    v.value,
    :created::timestamptz AS created
FROM (
    VALUES
    ('organizationMondayWorkingTimeStartISO',           :organizationMondayWorkingTimeStartISO),
    ('organizationMondayWorkingTimeEndISO',             :organizationMondayWorkingTimeEndISO),
    ('organizationTuesdayWorkingTimeStartISO',          :organizationTuesdayWorkingTimeStartISO),
    ('organizationTuesdayWorkingTimeEndISO',            :organizationTuesdayWorkingTimeEndISO),
    ('organizationWednesdayWorkingTimeStartISO',        :organizationWednesdayWorkingTimeStartISO),
    ('organizationWednesdayWorkingTimeEndISO',          :organizationWednesdayWorkingTimeEndISO),
    ('organizationThursdayWorkingTimeStartISO',         :organizationThursdayWorkingTimeStartISO),
    ('organizationThursdayWorkingTimeEndISO',           :organizationThursdayWorkingTimeEndISO),
    ('organizationFridayWorkingTimeStartISO',           :organizationFridayWorkingTimeStartISO),
    ('organizationFridayWorkingTimeEndISO',             :organizationFridayWorkingTimeEndISO),
    ('organizationSaturdayWorkingTimeStartISO',         :organizationSaturdayWorkingTimeStartISO),
    ('organizationSaturdayWorkingTimeEndISO',           :organizationSaturdayWorkingTimeEndISO),
    ('organizationSundayWorkingTimeStartISO',           :organizationSundayWorkingTimeStartISO),
    ('organizationSundayWorkingTimeEndISO',             :organizationSundayWorkingTimeEndISO),
    ('organizationAllWeekdaysTimeStartISO',             :organizationAllWeekdaysTimeStartISO),
    ('organizationAllWeekdaysTimeEndISO',               :organizationAllWeekdaysTimeEndISO),
    ('organizationWorkingTimeWeekdays',                 :organizationWorkingTimeWeekdays),
    ('organizationClosedOnWeekEnds',                    :organizationClosedOnWeekEnds),
    ('organizationTheSameOnAllWorkingDays',             :organizationTheSameOnAllWorkingDays),
    ('organizationWorkingTimeNationalHolidays',         :organizationWorkingTimeNationalHolidays),
    ('organizationWorkingAllTime',                      :organizationWorkingAllTime),
    ('organizationNoCsaAskForContacts',                 :organizationNoCsaAskForContacts),
    ('organizationNoCsaAvailableMessage',               :organizationNoCsaAvailableMessage),
    ('organizationOutsideWorkingHoursAskForContacts',   :organizationOutsideWorkingHoursAskForContacts),
    ('organizationOutsideWorkingHoursMessage',          :organizationOutsideWorkingHoursMessage),
    ('organizationBotCannotAnswerMessage',              :organizationBotCannotAnswerMessage),
    ('organizationRedirectIfBotCannotAnswerMessage',    :organizationRedirectIfBotCannotAnswerMessage),
    ('organizationUseCSA',                          :organizationUseCSA)
    ) AS v(key, value)
    )
INSERT INTO configuration (key, value, domain, created)
SELECT
    nc.key,
    nc.value,
    dl.domain,
    nc.created
FROM new_configuration AS nc
         CROSS JOIN domain_list      AS dl
         LEFT JOIN last_configuration AS lc
                   ON lc.domain = dl.domain
                       AND lc.key    = nc.key
WHERE
    nc.value IS DISTINCT FROM lc.value
    RETURNING key, value, domain;
