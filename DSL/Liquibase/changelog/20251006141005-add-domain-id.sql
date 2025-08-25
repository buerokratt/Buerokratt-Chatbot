-- liquibase formatted sql
-- changeset Vassili Moskaljov:20251006141005
ALTER TABLE widget_domains
    ADD COLUMN domain_id UUID;