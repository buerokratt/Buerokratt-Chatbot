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
SELECT copy_row_with_modifications(
    'request_nonces',
    'nonce', '', nonce,
    ARRAY['used_at', '::TIMESTAMP WITH TIME ZONE', NOW()::VARCHAR]::VARCHAR[]
) as nonce FROM request_nonces
WHERE nonce = :updated_nonce AND used_at IS null;
