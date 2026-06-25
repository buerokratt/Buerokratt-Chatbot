WITH configuration_values AS (
    SELECT id,
    KEY,
    value
FROM configuration
WHERE KEY IN ('organizationWorkingAllTime',
    'organizationNoCsaAskForContacts',
    'organizationNoCsaAvailableMessage',
    'organizationOutsideWorkingHoursAskForContacts',
    'organizationOutsideWorkingHoursMessage',
    'organizationBotCannotAnswerMessage',
    'organizationRedirectIfBotCannotAnswerMessage',
    'organizationUseCSA',
    'organizationValidationNoCsaMessage')
  AND "domain" = :domainUUID::UUID
  AND id IN (SELECT max(id) FROM configuration WHERE "domain" = :domainUUID::UUID GROUP BY KEY)
  AND NOT deleted
    )
SELECT
    MAX(CASE WHEN KEY = 'organizationWorkingAllTime' THEN value END) AS is_available_all_time,
    MAX(CASE WHEN KEY = 'organizationNoCsaAskForContacts' THEN value END) AS ask_for_contacts,
    MAX(CASE WHEN KEY = 'organizationNoCsaAvailableMessage' THEN value END) AS no_csa_message,
    MAX(CASE WHEN KEY = 'organizationOutsideWorkingHoursAskForContacts' THEN value END) AS outside_working_hours_ask_for_contacts,
    MAX(CASE WHEN KEY = 'organizationOutsideWorkingHoursMessage' THEN value END) AS outside_working_hours_message,
    MAX(CASE WHEN KEY = 'organizationBotCannotAnswerMessage' THEN value END) AS bot_cannot_answer_message,
    MAX(CASE WHEN KEY = 'organizationRedirectIfBotCannotAnswerMessage' THEN value END) AS redirect_if_bot_cannot_answer_message,
    MAX(CASE WHEN KEY = 'organizationUseCSA' THEN value END) AS is_organization_use_csa,
    MAX(CASE WHEN KEY = 'organizationValidationNoCsaMessage' THEN value END) AS validation_no_csa_message
FROM configuration_values;
