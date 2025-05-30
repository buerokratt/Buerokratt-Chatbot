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
WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM config.configuration AS c_1
        WHERE key IN (
            'organizationBotCannotAnswerAskToForwardToCSA',
            'organizationBotCannotAnswerMessage'
        )
        AND created = (
            SELECT MAX(c_2.created) FROM config.configuration AS c_2
            WHERE c_2.key = c_1.key
        )
        AND NOT deleted
    )

SELECT
    MAX(
        CASE WHEN key = 'organizationBotCannotAnswerAskToForwardToCSA' THEN value END
    ) AS is_ask_to_forward_to_csa,
    MAX(
        CASE WHEN key = 'organizationBotCannotAnswerMessage' THEN value END
    ) AS ask_to_forward_to_csa_message
FROM configuration_values;
