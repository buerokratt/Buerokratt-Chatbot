WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM configuration
    WHERE KEY IN ( 'organizationBotCannotAnswerMessage')
      AND id IN (SELECT max(id) FROM configuration GROUP BY KEY)
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'organizationBotCannotAnswerMessage' THEN value END) AS ask_to_forward_to_csa_message
FROM configuration_values;
