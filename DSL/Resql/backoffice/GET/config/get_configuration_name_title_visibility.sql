/*
declaration:
  version: 0.1
  description: "Fetch the latest values for CSA visibility configuration flags"
  method: get
  namespace: config
  returns: json
  allowlist:
    query: []
  response:
    fields:
      - field: is_csa_title_visible
        type: string
        description: "Flag indicating whether the CSA title is visible"
      - field: is_csa_name_visible
        type: string
        description: "Flag indicating whether the CSA name is visible"
*/
WITH
    configuration_values AS (
        SELECT
            id,
            key,
            value
        FROM config.configuration AS c_1
        WHERE key IN (
            'is_csa_title_visible',
            'is_csa_name_visible'
        )
        AND created = (
            SELECT MAX(c_2.created) FROM config.configuration AS c_2
            WHERE c_2.key = c_1.key
        )
        AND NOT deleted
    )

SELECT
    MAX(CASE WHEN key = 'is_csa_title_visible' THEN value END) AS is_csa_title_visible,
    MAX(CASE WHEN key = 'is_csa_name_visible' THEN value END) AS is_csa_name_visible
FROM configuration_values;
