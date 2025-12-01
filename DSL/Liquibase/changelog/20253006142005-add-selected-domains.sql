-- liquibase formatted sql
-- changeset Vassili Moskaljov:20253006142005
ALTER TABLE user_widget_domains
    ADD COLUMN selected_domains UUID[] NOT NULL DEFAULT '{}';