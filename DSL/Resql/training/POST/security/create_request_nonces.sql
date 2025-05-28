/*
declaration:
  version: 0.1
  description: "Generate a one-time request nonce valid for 24 hours"
  method: post
  returns: json
  namespace: security
  allowlist: {}
  response:
    fields:
      - field: nonce
        type: string
        description: "Generated unique request nonce"
*/
INSERT INTO security.request_nonces (valid_until) VALUES (NOW() + INTERVAL '1 day') RETURNING
    nonce;
