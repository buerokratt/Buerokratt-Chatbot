-- liquibase formatted sql
-- changeset Vassili Moskaljov:20250103092720
ALTER TABLE user_page_preferences
    ADD COLUMN selected_columns TEXT[] NULL;