SELECT
    service AS id,
    service_name AS name
FROM service_trigger
WHERE status = 'approved'
AND id = (
    SELECT MAX(id)
    FROM service_trigger
    WHERE service_name = :serviceName
);
