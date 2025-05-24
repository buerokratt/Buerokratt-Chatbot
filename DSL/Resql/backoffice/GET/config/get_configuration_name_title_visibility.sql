WITH configuration_values AS (
    SELECT id,
    KEY,
    value
FROM config.configuration AS c1
WHERE KEY IN ('is_csa_title_visible',
    'is_csa_name_visible')
  AND created = (
    SELECT MAX(c2.created) FROM config.configuration as c2
    WHERE c2.key = c1.key
    )
  AND NOT deleted
    )
SELECT
    MAX(CASE WHEN KEY = 'is_csa_title_visible' THEN value END) AS is_csa_title_visible,
    MAX(CASE WHEN KEY = 'is_csa_name_visible' THEN value END) AS is_csa_name_visible
FROM configuration_values;