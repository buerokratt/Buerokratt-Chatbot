UPDATE request_nonces SET used_at = NOW()
WHERE nonce = :updated_nonce AND used_at IS null RETURNING nonce;
