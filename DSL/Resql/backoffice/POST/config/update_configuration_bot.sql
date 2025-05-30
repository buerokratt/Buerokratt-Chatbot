/*
declaration:
  version: 0.1
  description: "Insert updated configuration values only if they differ from the most recent non-deleted values"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: is_bot_active
        type: string
        description: "Enable or disable bot functionality"
      - field: is_burokratt_active
        type: string
        description: "Enable or disable Bürokratt functionality"
      - field: is_csa_name_visible
        type: string
        description: "Toggle visibility of customer support agent's name"
      - field: is_csa_title_visible
        type: string
        description: "Toggle visibility of customer support agent's title"
      - field: is_edit_chat_visible
        type: string
        description: "Toggle visibility of the chat edit button"
*/
WITH
    last_configuration AS (
        SELECT
            key,
            value
        FROM config.configuration AS c_1
        WHERE key IN (
            'is_bot_active',
            'is_burokratt_active',
            'is_csa_name_visible',
            'is_csa_title_visible',
            'is_edit_chat_visible'
        )
        AND created = (
            SELECT MAX(c_2.created) FROM config.configuration AS c_2
            WHERE c_1.key = c_2.key
        )
        AND deleted = FALSE
    ),

    new_configuration AS (
        SELECT
            new_values.key,
            new_values.value
        FROM (
            VALUES
            ('is_bot_active', :is_bot_active),
            ('is_burokratt_active', :is_burokratt_active),
            ('is_csa_name_visible', :is_csa_name_visible),
            ('is_csa_title_visible', :is_csa_title_visible),
            ('is_edit_chat_visible', :is_edit_chat_visible)
        ) AS new_values (key, value)
    )

INSERT INTO config.configuration (key, value)
SELECT
    new_configuration.key,
    new_configuration.value
FROM new_configuration
    INNER JOIN last_configuration ON new_configuration.key = last_configuration.key
WHERE new_configuration.value IS DISTINCT FROM last_configuration.value
