/*
declaration:
  version: 0.1
  description: "Get approved service trigger by service name"
  method: get
  namespace: service_management
  returns: json
  allowlist:
    query:
      - field: serviceName
        type: string
        description: "Name of service
  response:
    fields:
      - field: id
        type: string
        description: "Service ID"
      - field: name
        type: string
        description: "Service name"
*/
SELECT
    service AS id,
    service_name AS name
FROM service_trigger
WHERE
    status = 'approved'
    AND id = (
        SELECT MAX(id)
        FROM service_trigger
        WHERE service_name = :serviceName
    );
