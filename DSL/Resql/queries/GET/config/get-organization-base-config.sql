WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ('organizationWorkingAllTime', 
                  'organizationNoCsaAskForContacts', 
                  'organizationNoCsaAvailableMessage',
                  'organizationOutsideWorkingHoursAskForContacts',
                  'organizationOutsideWorkingHoursMessage')
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'organizationWorkingAllTime' THEN value END) AS is_available_all_time,
    MAX(CASE WHEN KEY = 'organizationNoCsaAskForContacts' THEN value END) AS ask_for_contacts,
    MAX(CASE WHEN KEY = 'organizationNoCsaAvailableMessage' THEN value END) AS no_csa_message,
    MAX(CASE WHEN KEY = 'organizationOutsideWorkingHoursAskForContacts' THEN value END) AS outside_working_hours_ask_for_contacts,
    MAX(CASE WHEN KEY = 'organizationOutsideWorkingHoursMessage' THEN value END) AS outside_working_hours_message
FROM configuration_values;
