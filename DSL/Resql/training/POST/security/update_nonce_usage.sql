SELECT copy_row_with_modifications(
    'request_nonces',
    'nonce', '', nonce,
    ARRAY['used_at', '::TIMESTAMP', NOW()::VARCHAR]::VARCHAR[]
) as nonce FROM request_nonces
WHERE nonce = :updated_nonce AND used_at IS null;
