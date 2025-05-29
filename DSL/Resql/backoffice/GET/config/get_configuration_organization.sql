/*
declaration:
  version: 0.1
  description: "Fetch organization availability and fallback message configurations"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: is_available_all_time
        type: string
        description: "Flag indicating whether the organization is available at all times"
      - field: ask_for_contacts
        type: string
        description: "Flag indicating whether to ask for contacts when no CSA is available"
      - field: no_csa_message
        type: string
        description: "Message shown when no CSA is available"
      - field: outside_working_hours_ask_for_contacts
        type: string
        description: "Flag indicating whether to ask for contacts outside working hours"
      - field: outside_working_hours_message
        type: string
        description: "Message shown when outside working hours"
*/
WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM config.configuration AS c_1
        WHERE key IN (
            'organizationWorkingAllTime',
            'organizationNoCsaAskForContacts',
            'organizationNoCsaAvailableMessage',
            'organizationOutsideWorkingHoursAskForContacts',
            'organizationOutsideWorkingHoursMessage'
        )
        AND created = (
            SELECT MAX(c_2.created) FROM config.configuration AS c_2
            WHERE c_2.key = c_1.key
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
