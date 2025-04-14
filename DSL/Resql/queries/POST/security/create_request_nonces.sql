INSERT INTO request_nonces (valid_until) VALUES (NOW() + INTERVAL '1 day') RETURNING
    nonce;
