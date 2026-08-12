WITH grouped_configurations AS (
    SELECT max(id) maxId
    FROM configuration
    WHERE "domain" = :domainUUID::UUID
    GROUP BY key
    )
SELECT
    (CASE WHEN (est.value IS NULL OR est.deleted IS true) THEN '' ELSE est.value END) AS est,
    (CASE WHEN (active.value = 'true' AND active.deleted IS false) THEN true ELSE false END) AS is_active,
    (CASE WHEN (type.value IS NULL OR type.deleted IS true) THEN 'message' ELSE type.value END) AS type,
    (CASE WHEN (service_id.value IS NULL OR service_id.deleted IS true OR NOT EXISTS (SELECT 1 FROM services s WHERE s.service_id = service_id.value AND NOT s.deleted)) THEN '' ELSE service_id.value END) AS service_id,
    (CASE WHEN (service_id.value IS NULL OR service_id.deleted IS true OR NOT EXISTS (SELECT 1 FROM services s WHERE s.service_id = service_id.value AND NOT s.deleted)) THEN '' ELSE service_name.value END) AS service_name
FROM
    (
        SELECT id, key, value, deleted
        FROM configuration
        WHERE key = 'greeting_message_est'
          AND id IN (SELECT maxId FROM grouped_configurations)
          AND "domain" = :domainUUID::UUID
        UNION ALL
        SELECT null, null, null, null
            LIMIT 1
    ) AS est,
    (
        SELECT id, key, value, deleted
        FROM configuration
        WHERE key = 'is_greeting_message_active'
          AND id IN (SELECT maxId FROM grouped_configurations)
          AND "domain" = :domainUUID::UUID
        UNION ALL
        SELECT null, null, null, null
            LIMIT 1
    ) AS active,
    (
        SELECT id, key, value, deleted
        FROM configuration
        WHERE key = 'greeting_type'
          AND id IN (SELECT maxId FROM grouped_configurations)
          AND "domain" = :domainUUID::UUID
        UNION ALL
        SELECT null, null, null, null
            LIMIT 1
    ) AS type,
    (
        SELECT id, key, value, deleted
        FROM configuration
        WHERE key = 'greeting_service_id'
          AND id IN (SELECT maxId FROM grouped_configurations)
          AND "domain" = :domainUUID::UUID
        UNION ALL
        SELECT null, null, null, null
            LIMIT 1
    ) AS service_id,
    (
        SELECT id, key, value, deleted
        FROM configuration
        WHERE key = 'greeting_service_name'
          AND id IN (SELECT maxId FROM grouped_configurations)
          AND "domain" = :domainUUID::UUID
        UNION ALL
        SELECT null, null, null, null
            LIMIT 1
    ) AS service_name;
