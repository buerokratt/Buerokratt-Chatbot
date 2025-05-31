/*
declaration:
  version: 0.1
  description: "Mark a request nonce as used by setting the used_at timestamp"
  method: post
  accepts: json
  returns: json
  namespace: security
  allowlist:
    body:
      - field: updated_nonce
        type: string
        description: "The nonce value to mark as used"
  response:
    fields:
      - field: nonce
        type: string
        description: "The nonce that was marked as used"
*/
INSERT INTO security.request_nonces (nonce, valid_until, used_at)
SELECT
    :updated_nonce,
    valid_until,
    NOW()
FROM security.request_nonces
WHERE
    nonce = ''
    AND created_at
    = (
        SELECT MAX(created_at) FROM security.request_nonces
        WHERE nonce = :updated_nonce
    )
    AND used_at IS NULL
RETURNING nonce;
