-- liquibase formatted sql
-- changeset Vassili Moskaljov:20251006142515
CREATE TABLE user_widget_domains
(
    id         BIGSERIAL PRIMARY KEY,
    user_login TEXT                     NOT NULL,
    domain_id  UUID[] NOT NULL,
    created    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now())
);