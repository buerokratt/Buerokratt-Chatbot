WITH configuration_values AS (
    SELECT id,
           KEY,
           value
    FROM config.configuration AS c1
    WHERE KEY IN ('organizationBotCannotAnswerAskToForwardToCSA', 
                  'organizationBotCannotAnswerMessage')
      AND created = (
        SELECT MAX(c2.created) FROM config.configuration as c2
        WHERE c2.key = c1.key
        )
      AND NOT deleted
)
SELECT
    MAX(CASE WHEN KEY = 'organizationBotCannotAnswerAskToForwardToCSA' THEN value END) AS is_ask_to_forward_to_csa,
    MAX(CASE WHEN KEY = 'organizationBotCannotAnswerMessage' THEN value END) AS ask_to_forward_to_csa_message
FROM configuration_values;
