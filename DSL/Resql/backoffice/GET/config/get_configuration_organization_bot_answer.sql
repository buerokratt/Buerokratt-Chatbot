/*
declaration:
  version: 0.1
  description: "Fetch configuration values for bot fallback behavior when it cannot answer"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: is_ask_to_forward_to_csa
        type: string
        description: "Flag indicating whether to ask to forward to CSA when bot cannot answer"
      - field: ask_to_forward_to_csa_message
        type: string
        description: "Message displayed when bot cannot answer and forwarding is enabled"
*/
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
