-- liquibase formatted sql
-- changeset jannostern:20250211084322

CREATE TABLE request_nonces(
        nonce varchar(36) DEFAULT (gen_random_uuid()),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT (now()),
        valid_until TIMESTAMP WITH TIME ZONE,
        used_at TIMESTAMP );
