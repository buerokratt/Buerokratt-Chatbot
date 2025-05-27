/*
declaration:
  version: 0.1
  description: "Insert a new configuration key-value pair into the system"
  method: post
  accepts: json
  returns: json
  namespace: config
  allowlist:
    body:
      - field: key
        type: string
        description: "Configuration key name"
      - field: value
        type: string
        description: "Configuration value"
*/

INSERT INTO configuration (key, value)
VALUES (:key, :value);
