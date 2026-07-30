WITH last_configuration AS (
    SELECT value
    FROM configuration
    WHERE key = 'azure_client_id_is_set'
      AND domain IS NULL
      AND deleted = FALSE
    ORDER BY id DESC
    LIMIT 1
)
INSERT INTO configuration (key, value, created)
SELECT 'azure_client_id_is_set', :azure_client_id_is_set, now()
WHERE NOT EXISTS (
    SELECT 1 FROM last_configuration WHERE value = :azure_client_id_is_set
);
