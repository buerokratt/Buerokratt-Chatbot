WITH all_time_availability_config AS
  (SELECT id,
          KEY,
          value
   FROM configuration
   WHERE KEY IN ('organizationWorkingAllTime')
     AND id IN
       (SELECT max(id)
        FROM configuration
        GROUP BY KEY)
     AND NOT deleted),
     ask_for_contacts_config AS
  (SELECT id,
          KEY,
          value
   FROM configuration
   WHERE KEY IN ('organizationNoCsaAskForContacts')
     AND id IN
       (SELECT max(id)
        FROM configuration
        GROUP BY KEY)
     AND NOT deleted),
     csa_no_available_message_config AS
  (SELECT id,
          KEY,
          value
   FROM configuration
   WHERE KEY IN ('organizationNoCsaAvailableMessage')
     AND id IN
       (SELECT max(id)
        FROM configuration
        GROUP BY KEY)
     AND NOT deleted)
SELECT
  (SELECT value AS is_available_all_time
   FROM all_time_availability_config),
  (SELECT value AS ask_for_contacts
   FROM ask_for_contacts_config),
  (SELECT value AS no_csa_message
   FROM csa_no_available_message_config);
