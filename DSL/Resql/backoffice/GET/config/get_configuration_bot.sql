/*
declaration:
  version: 0.1
  description: "Fetch the latest values for specific UI-related configuration flags"
  method: get
  namespace: config
  allowlist:
    query: []
  response:
    fields:
      - field: is_bot_active
        type: string
        description: "Flag indicating whether the bot is active"
      - field: is_burokratt_active
        type: string
        description: "Flag indicating whether Burokratt is active"
      - field: is_csa_name_visible
        type: string
        description: "Flag indicating whether the CSA name is visible"
      - field: is_csa_title_visible
        type: string
        description: "Flag indicating whether the CSA title is visible"
      - field: is_edit_chat_visible
        type: string
        description: "Flag indicating whether editing chat is allowed"
*/
WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM configuration AS c1
        WHERE key IN (
            'is_bot_active',
            'is_burokratt_active',
            'is_csa_name_visible',
            'is_csa_title_visible',
            'is_edit_chat_visible'
        )
        AND created = (
            SELECT MAX(c2.created) FROM configuration AS c2
            WHERE c1.key = c2.key
        )
        AND NOT deleted
    )

SELECT
    MAX(CASE WHEN key = 'is_bot_active' THEN value END) AS is_bot_active,
    MAX(CASE WHEN key = 'is_burokratt_active' THEN value END) AS is_burokratt_active,
    MAX(CASE WHEN key = 'is_csa_name_visible' THEN value END) AS is_csa_name_visible,
    MAX(CASE WHEN key = 'is_csa_title_visible' THEN value END) AS is_csa_title_visible,
    MAX(CASE WHEN key = 'is_edit_chat_visible' THEN value END) AS is_edit_chat_visible
FROM configuration_values;
