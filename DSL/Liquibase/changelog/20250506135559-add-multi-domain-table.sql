-- liquibase formatted sql
-- changeset Vassili Moskaljov:20250506135559
CREATE TABLE widget_domains
(
    id      BIGSERIAL PRIMARY KEY,
    name    TEXT    NOT NULL,
    url     TEXT    NOT NULL,
    active  BOOLEAN NOT NULL,
    created TIMESTAMP WITH TIME ZONE DEFAULT (now())
);