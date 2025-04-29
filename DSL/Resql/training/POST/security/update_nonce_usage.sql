SELECT copy_row_with_modifications(
    'request_nonces',
    'nonce', '', nonce,
    'used_at', '::TIMESTAMP', NOW()::TEXT
) as nonce FROM request_nonces
WHERE nonce = :updated_nonce AND used_at IS null;
