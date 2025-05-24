WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM config.configuration AS c1
        WHERE key IN (
            'organizationWorkingAllTime',
            'organizationNoCsaAskForContacts',
            'organizationNoCsaAvailableMessage',
            'organizationOutsideWorkingHoursAskForContacts',
            'organizationOutsideWorkingHoursMessage'
        )
        AND created = (
            SELECT MAX(c2.created) FROM config.configuration as c2
            WHERE c2.key = c1.key
        )
        AND NOT deleted
    )

SELECT
    MAX(
        CASE WHEN key = 'organizationWorkingAllTime' THEN value END
    ) AS is_available_all_time,
    MAX(
        CASE WHEN key = 'organizationNoCsaAskForContacts' THEN value END
    ) AS ask_for_contacts,
    MAX(
        CASE WHEN key = 'organizationNoCsaAvailableMessage' THEN value END
    ) AS no_csa_message,
    MAX(
        CASE WHEN key = 'organizationOutsideWorkingHoursAskForContacts' THEN value END
    ) AS outside_working_hours_ask_for_contacts,
    MAX(
        CASE WHEN key = 'organizationOutsideWorkingHoursMessage' THEN value END
    ) AS outside_working_hours_message
FROM configuration_values;
